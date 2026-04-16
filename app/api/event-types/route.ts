import { z } from 'zod'
import { NextResponse } from 'next/server'
import { DEFAULT_USER_ID, getOrCreateDefaultUser, getPrismaClient } from '@/lib/prisma'
import { buildMockEventTypeStore, mapDbEventTypeToDto } from '@/lib/booking-helpers'
import type { BookingQuestion } from '@/lib/types'

export const runtime = 'nodejs'

const SlugSchema = z.string().min(1)

const BookingQuestionOptionSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
})

const BookingQuestionSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1),
  type: z.enum(['short_text', 'long_text', 'select']),
  required: z.boolean().default(false),
  options: z.array(BookingQuestionOptionSchema).optional(),
})

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function prismaToEventTypeDto(eventType: any) {
  return mapDbEventTypeToDto(eventType)
}

type MockEventTypeDto = ReturnType<typeof prismaToEventTypeDto>

function getMockEventTypeStore(): MockEventTypeDto[] {
  return buildMockEventTypeStore()
}

function normalizeQuestions(
  questions?: Array<Omit<BookingQuestion, 'id'> & { id?: string }>
) {
  return (questions ?? []).map((question, index) => ({
    id: question.id ?? `q_${Date.now()}_${index}_${Math.random().toString(16).slice(2)}`,
    label: question.label,
    type: question.type,
    required: question.required,
    options: question.options ?? [],
  }))
}

const CreateEventTypeSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(''),
  duration: z.number().int().positive(),
  slug: SlugSchema.optional(),
  color: z.string().optional(),
  bufferBeforeMinutes: z.number().int().min(0).default(0),
  bufferAfterMinutes: z.number().int().min(0).default(0),
  questions: z.array(BookingQuestionSchema).default([]),
})

const UpdateEventTypeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional().default(''),
  duration: z.number().int().positive(),
  slug: SlugSchema.optional(),
  color: z.string().optional(),
  bufferBeforeMinutes: z.number().int().min(0).default(0),
  bufferAfterMinutes: z.number().int().min(0).default(0),
  questions: z.array(BookingQuestionSchema).default([]),
})

const DeleteEventTypeSchema = z.object({
  id: z.string().min(1),
})

export async function GET() {
  await getOrCreateDefaultUser()
  const prisma = getPrismaClient()
  if (!prisma) {
    const eventTypes = getMockEventTypeStore().slice().sort((a, b) => b.id.localeCompare(a.id))
    return NextResponse.json({ eventTypes })
  }
  const eventTypes = await prisma.eventType.findMany({
    where: { userId: DEFAULT_USER_ID },
    orderBy: { createdAt: 'desc' },
    include: {
      bookingQuestions: {
        orderBy: { position: 'asc' },
      },
    },
  })

  return NextResponse.json({
    eventTypes: eventTypes.map(prismaToEventTypeDto),
  })
}

export async function POST(request: Request) {
  await getOrCreateDefaultUser()
  const prisma = getPrismaClient()
  if (!prisma) {
    const body = await request.json().catch(() => null)
    const parsed = CreateEventTypeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data
    const slug = data.slug ?? slugify(data.title)
    const store = getMockEventTypeStore()
    const exists = store.some((et) => et.slug === slug)
    if (exists) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }

    const created: MockEventTypeDto = {
      id: `mock_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      title: data.title,
      description: data.description,
      duration: data.duration,
      slug,
      color: data.color ?? 'bg-blue-500',
      bufferBeforeMinutes: data.bufferBeforeMinutes,
      bufferAfterMinutes: data.bufferAfterMinutes,
      questions: normalizeQuestions(data.questions),
      userId: DEFAULT_USER_ID,
    }
    store.push(created)
    return NextResponse.json({ eventType: created }, { status: 201 })
  }

  const body = await request.json().catch(() => null)
  const parsed = CreateEventTypeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data
  const slug = data.slug ?? slugify(data.title)

  try {
    const created = await prisma.eventType.create({
      data: {
        title: data.title,
        description: data.description,
        duration: data.duration,
        slug,
        color: data.color ?? 'bg-blue-500',
        bufferBeforeMinutes: data.bufferBeforeMinutes,
        bufferAfterMinutes: data.bufferAfterMinutes,
        userId: DEFAULT_USER_ID,
        bookingQuestions: {
          create: data.questions.map((question, index) => ({
            label: question.label,
            type: question.type,
            required: question.required,
            position: index,
            optionsJson: question.options?.length
              ? JSON.stringify(question.options)
              : null,
          })),
        },
      },
      include: {
        bookingQuestions: {
          orderBy: { position: 'asc' },
        },
      },
    })
    return NextResponse.json({ eventType: prismaToEventTypeDto(created) }, { status: 201 })
  } catch (e: any) {
    // Prisma unique constraint error.
    if (e?.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }
    throw e
  }
}

export async function PUT(request: Request) {
  await getOrCreateDefaultUser()
  const prisma = getPrismaClient()
  if (!prisma) {
    const body = await request.json().catch(() => null)
    const parsed = UpdateEventTypeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data
    const slug = data.slug ?? slugify(data.title)
    const store = getMockEventTypeStore()

    // Prevent slug collisions with other records.
    const slugTaken = store.some((et) => et.slug === slug && et.id !== data.id)
    if (slugTaken) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }

    const idx = store.findIndex((et) => et.id === data.id && et.userId === DEFAULT_USER_ID)
    if (idx === -1) {
      return NextResponse.json({ error: 'Event type not found' }, { status: 404 })
    }

    store[idx] = {
      ...store[idx],
      title: data.title,
      description: data.description,
      duration: data.duration,
      slug,
      color: data.color ?? store[idx].color ?? 'bg-blue-500',
      bufferBeforeMinutes: data.bufferBeforeMinutes,
      bufferAfterMinutes: data.bufferAfterMinutes,
      questions: normalizeQuestions(data.questions),
    }

    return NextResponse.json({ eventType: store[idx] })
  }

  const body = await request.json().catch(() => null)
  const parsed = UpdateEventTypeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data
  const slug = data.slug ?? slugify(data.title)

  try {
    // Ensure we only update the default user's record.
    const updated = await prisma.eventType.updateMany({
      where: { id: data.id, userId: DEFAULT_USER_ID },
      data: {
        title: data.title,
        description: data.description,
        duration: data.duration,
        slug,
        color: data.color ?? 'bg-blue-500',
        bufferBeforeMinutes: data.bufferBeforeMinutes,
        bufferAfterMinutes: data.bufferAfterMinutes,
      },
    })

    if (updated.count === 0) {
      return NextResponse.json({ error: 'Event type not found' }, { status: 404 })
    }

    await prisma.bookingQuestion.deleteMany({
      where: { eventTypeId: data.id },
    })

    if (data.questions.length > 0) {
      await prisma.bookingQuestion.createMany({
        data: data.questions.map((question, index) => ({
          eventTypeId: data.id,
          label: question.label,
          type: question.type,
          required: question.required,
          position: index,
          optionsJson: question.options?.length
            ? JSON.stringify(question.options)
            : null,
        })),
      })
    }

    const eventType = await prisma.eventType.findUnique({
      where: { id: data.id },
      include: {
        bookingQuestions: {
          orderBy: { position: 'asc' },
        },
      },
    })
    return NextResponse.json({ eventType: eventType ? prismaToEventTypeDto(eventType) : null })
  } catch (e: any) {
    if (e?.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }
    throw e
  }
}

export async function DELETE(request: Request) {
  await getOrCreateDefaultUser()
  const prisma = getPrismaClient()
  if (!prisma) {
    const body = await request.json().catch(() => null)
    const parsed = DeleteEventTypeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { id } = parsed.data
    const store = getMockEventTypeStore()
    const before = store.length
    const next = store.filter((et) => !(et.id === id && et.userId === DEFAULT_USER_ID))
    if (next.length === before) {
      return NextResponse.json({ error: 'Event type not found' }, { status: 404 })
    }

    // Mutate in place to keep references stable.
    store.splice(0, store.length, ...next)
    return NextResponse.json({ ok: true })
  }

  const body = await request.json().catch(() => null)
  const parsed = DeleteEventTypeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { id } = parsed.data

  const deleted = await prisma.eventType.deleteMany({
    where: { id, userId: DEFAULT_USER_ID },
  })

  if (deleted.count === 0) {
    return NextResponse.json({ error: 'Event type not found' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}

