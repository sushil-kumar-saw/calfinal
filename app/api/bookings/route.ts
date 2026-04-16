import { z } from 'zod'
import { NextResponse } from 'next/server'
import { DEFAULT_USER_ID, getOrCreateDefaultUser, getPrismaClient } from '@/lib/prisma'
import { parseHHMMToMinutes, formatMinutesToHHMM } from '@/lib/slots'
import {
  availabilityRangesFromWeeklyAndOverrides,
  bookingBlockedRanges,
  buildMockAvailabilityStore,
  buildMockDateOverrideStore,
  buildMockEventTypeStore,
  dateStringToUtcDate,
  getDayOfWeekFromDateString,
  getMockTimezone,
  getOverrideForDate,
  isSlotInPast,
  mapDbEventTypeToDto,
  minutesToTimeOnlyDate,
  parseQuestionOptions,
  rangesOverlap,
  timeOnlyToMinutes,
} from '@/lib/booking-helpers'
import { logNotification } from '@/lib/notifications'

export const runtime = 'nodejs'

const BookingAnswerSchema = z.object({
  questionId: z.string().min(1),
  value: z.string().default(''),
})

const CreateBookingSchema = z.object({
  eventSlug: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  startTime: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM (24h)
  notes: z.string().optional().default(''),
  answers: z.array(BookingAnswerSchema).default([]),
})

const CancelBookingSchema = z.object({
  id: z.string().min(1),
})

function bookingToDto(booking: any) {
  const startMinutes = timeOnlyToMinutes(booking.startTime)
  const endMinutes = timeOnlyToMinutes(booking.endTime)
  return {
    id: booking.id,
    name: booking.name,
    email: booking.email,
    eventTypeId: booking.eventTypeId,
    eventTypeTitle: booking.eventType?.title ?? null,
    eventSlug: booking.eventType?.slug ?? booking.eventSlug ?? null,
    date: booking.date.toISOString().split('T')[0],
    startTime: formatMinutesToHHMM(startMinutes),
    endTime: formatMinutesToHHMM(endMinutes),
    notes: booking.notes ?? '',
    answers: (booking.answers ?? []).map((answer: any) => ({
      questionId: answer.bookingQuestionId ?? answer.questionId,
      questionLabel: answer.bookingQuestion?.label ?? answer.questionLabel ?? '',
      value: answer.value,
    })),
    status: booking.status,
    rescheduledFromId: booking.rescheduledFromId ?? null,
    rescheduledToId:
      booking.rescheduledTo?.[0]?.id ??
      booking.rescheduledToId ??
      null,
    createdAt: booking.createdAt,
  }
}

function validateAnswers(questions: any[], answers: Array<{ questionId: string; value: string }>) {
  const byId = new Map(questions.map((question) => [question.id, question]))

  for (const question of questions) {
    const answer = answers.find((item) => item.questionId === question.id)
    const value = answer?.value?.trim() ?? ''

    if (question.required && !value) {
      return `Missing answer for "${question.label}"`
    }

    const options = parseQuestionOptions(question.optionsJson)
    if (question.type === 'select' && value) {
      const valid = (options ?? []).some((option: any) => option.value === value)
      if (!valid) {
        return `Invalid answer for "${question.label}"`
      }
    }
  }

  for (const answer of answers) {
    if (!byId.has(answer.questionId)) {
      return 'Answer contains unknown question'
    }
  }

  return null
}

export async function GET(request: Request) {
  await getOrCreateDefaultUser()
  const prisma = getPrismaClient()
  if (!prisma) {
    const url = new URL(request.url)
    const eventSlug = url.searchParams.get('eventSlug')
    const dateStr = url.searchParams.get('date')
    const status = url.searchParams.get('status')

    const g = globalThis as unknown as {
      __aj_cal_mockBookings?: any[]
      __aj_cal_mockAvailability?: Array<{ dayOfWeek: number; enabled: boolean; ranges: Array<{ startTime: string; endTime: string }> }>
    }

    if (!g.__aj_cal_mockBookings) {
      g.__aj_cal_mockBookings = []
    }

    const eventTypeId =
      eventSlug
        ? buildMockEventTypeStore().find((et) => et.slug === eventSlug && et.userId === DEFAULT_USER_ID)?.id
        : undefined

    const bookings = g.__aj_cal_mockBookings
      .filter((b) => {
        if (eventSlug && eventTypeId && b.eventTypeId !== eventTypeId) return false
        if (eventSlug && !eventTypeId) return false
        if (dateStr && b.date.toISOString().split('T')[0] !== dateStr) return false
        if (status && b.status !== status) return false
        return true
      })
      .sort((a, b) => {
        const dateA = a.date.getTime()
        const dateB = b.date.getTime()
        if (dateA !== dateB) return dateA - dateB
        return timeOnlyToMinutes(a.startTime) - timeOnlyToMinutes(b.startTime)
      })

    return NextResponse.json({ bookings: bookings.map(bookingToDto) })
  }

  const url = new URL(request.url)
  const eventSlug = url.searchParams.get('eventSlug')
  const dateStr = url.searchParams.get('date')
  const status = url.searchParams.get('status')

  const where: any = {
    eventType: { userId: DEFAULT_USER_ID },
  }

  if (eventSlug) {
    where.eventType = { ...(where.eventType ?? {}), slug: eventSlug }
  }

  if (dateStr) {
    where.date = dateStringToUtcDate(dateStr)
  }

  if (status) {
    where.status = status
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      eventType: { select: { title: true, slug: true } },
      answers: {
        include: {
          bookingQuestion: true,
        },
      },
      rescheduledTo: {
        select: { id: true },
      },
    },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  })

  return NextResponse.json({ bookings: bookings.map(bookingToDto) })
}

export async function POST(request: Request) {
  await getOrCreateDefaultUser()
  const prisma = getPrismaClient()
  if (!prisma) {
    const body = await request.json().catch(() => null)
    const parsed = CreateBookingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { eventSlug, name, email, date, startTime, notes, answers } = parsed.data

    const g = globalThis as unknown as {
      __aj_cal_mockBookings?: any[]
    }

    if (!g.__aj_cal_mockBookings) {
      g.__aj_cal_mockBookings = []
    }

    const eventType = buildMockEventTypeStore().find((et) => et.slug === eventSlug && et.userId === DEFAULT_USER_ID) ?? null
    if (!eventType) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const questionError = validateAnswers(eventType.questions ?? [], answers)
    if (questionError) {
      return NextResponse.json({ error: questionError }, { status: 400 })
    }

    const startMinutes = parseHHMMToMinutes(startTime)
    const endMinutes = startMinutes + eventType.duration
    if (endMinutes > 24 * 60) {
      return NextResponse.json({ error: 'Booking exceeds day boundary' }, { status: 400 })
    }

    if (isSlotInPast({ date, startMinutes, timeZone: getMockTimezone() })) {
      return NextResponse.json({ error: 'Cannot book past slots' }, { status: 400 })
    }

    // Validate the slot fits inside weekly availability.
    const dayOfWeek = getDayOfWeekFromDateString(date)
    const dayAvailability = buildMockAvailabilityStore().find((d) => d.dayOfWeek === dayOfWeek)
    const override = getOverrideForDate(buildMockDateOverrideStore(), date)
    const availabilityRanges = availabilityRangesFromWeeklyAndOverrides({
      weeklyRanges: dayAvailability?.ranges ?? [],
      override,
    })

    // If an override exists for this date, it should be authoritative even if the weekly day is disabled.
    const slotIsWithinAvailability = availabilityRanges.some(
      (r) => startMinutes >= r.startTimeMinutes && endMinutes <= r.endTimeMinutes
    )

    if (!slotIsWithinAvailability) {
      return NextResponse.json({ error: 'Slot is not available' }, { status: 400 })
    }

    // Prevent double booking (overlap-based).
    const confirmedBookings = g.__aj_cal_mockBookings.filter((b) => {
      const sameDate = b.date.toISOString().split('T')[0] === date
      return b.eventTypeId === eventType.id && sameDate && b.status === 'confirmed'
    })

    const overlaps = bookingBlockedRanges({
      bookings: confirmedBookings.map((b) => ({
        startTimeMinutes: timeOnlyToMinutes(b.startTime),
        endTimeMinutes: timeOnlyToMinutes(b.endTime),
      })),
      eventType,
    }).some((range) =>
      rangesOverlap(startMinutes, endMinutes, range.startTimeMinutes, range.endTimeMinutes)
    )

    if (overlaps) {
      return NextResponse.json({ error: 'Slot already booked' }, { status: 409 })
    }

    const id = `mock_${Date.now()}_${Math.random().toString(16).slice(2)}`
    const created = {
      id,
      name,
      email,
      date: dateStringToUtcDate(date),
      startTime: minutesToTimeOnlyDate(startMinutes),
      endTime: minutesToTimeOnlyDate(endMinutes),
      notes,
      answers: answers.map((answer) => {
        const question = (eventType.questions ?? []).find((q) => q.id === answer.questionId)
        return {
          questionId: answer.questionId,
          questionLabel: question?.label ?? '',
          value: answer.value,
        }
      }),
      status: 'confirmed' as const,
      eventTypeId: eventType.id,
      eventType: { title: eventType.title, slug: eventType.slug },
      createdAt: new Date(),
      rescheduledFromId: null,
      rescheduledTo: [],
    }

    g.__aj_cal_mockBookings.push(created)
    await logNotification(null, {
      bookingId: created.id,
      recipient: email,
      subject: `Booking confirmed: ${eventType.title}`,
      type: 'booking_confirmed',
      payload: {
        eventSlug,
        date,
        startTime,
        notes,
      },
    })
    return NextResponse.json({ booking: bookingToDto(created) }, { status: 201 })
  }

  const body = await request.json().catch(() => null)
  const parsed = CreateBookingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { eventSlug, name, email, date, startTime, notes, answers } = parsed.data

  const eventType = await prisma.eventType.findUnique({
    where: { slug: eventSlug },
    include: {
      bookingQuestions: {
        orderBy: { position: 'asc' },
      },
    },
  })
  if (!eventType || eventType.userId !== DEFAULT_USER_ID) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  const eventTypeDto = mapDbEventTypeToDto(eventType)

  const questionError = validateAnswers(eventType.bookingQuestions, answers)
  if (questionError) {
    return NextResponse.json({ error: questionError }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: DEFAULT_USER_ID },
    select: { timezone: true, activeAvailabilitySchedule: true },
  })
  const timezone = user?.timezone ?? 'America/New_York'
  const activeScheduleName = user?.activeAvailabilitySchedule ?? 'Default Schedule'

  const startMinutes = parseHHMMToMinutes(startTime)
  const endMinutes = startMinutes + eventType.duration
  if (endMinutes > 24 * 60) {
    return NextResponse.json({ error: 'Booking exceeds day boundary' }, { status: 400 })
  }

  if (isSlotInPast({ date, startMinutes, timeZone: timezone })) {
    return NextResponse.json({ error: 'Cannot book past slots' }, { status: 400 })
  }

  // Validate the slot fits inside weekly availability.
  const dayOfWeek = getDayOfWeekFromDateString(date)
  const availabilityRows = await prisma.availability.findMany({
    where: { userId: DEFAULT_USER_ID, dayOfWeek, scheduleName: activeScheduleName },
  })

  const overrideRows = await prisma.dateOverride.findMany({
    where: { userId: DEFAULT_USER_ID, date: dateStringToUtcDate(date) },
    orderBy: { startTime: 'asc' },
  })

  const override =
    overrideRows.length === 0
      ? null
      : {
          blocked: overrideRows.some((row: any) => row.blocked),
          slots: overrideRows
            .filter((row: any) => !row.blocked && row.startTime && row.endTime)
            .map((row: any) => ({
              start: `${row.startTime.getUTCHours().toString().padStart(2, '0')}:${row.startTime.getUTCMinutes().toString().padStart(2, '0')}`,
              end: `${row.endTime.getUTCHours().toString().padStart(2, '0')}:${row.endTime.getUTCMinutes().toString().padStart(2, '0')}`,
            })),
        }

  const availabilityRanges = availabilityRangesFromWeeklyAndOverrides({
    weeklyRanges: availabilityRows.map((r: any) => ({
      startTime: `${r.startTime.getUTCHours().toString().padStart(2, '0')}:${r.startTime.getUTCMinutes().toString().padStart(2, '0')}`,
      endTime: `${r.endTime.getUTCHours().toString().padStart(2, '0')}:${r.endTime.getUTCMinutes().toString().padStart(2, '0')}`,
    })),
    override,
  })

  const slotIsWithinAvailability = availabilityRanges.some(
    (r: any) => startMinutes >= r.startTimeMinutes && endMinutes <= r.endTimeMinutes
  )

  if (!slotIsWithinAvailability) {
    return NextResponse.json({ error: 'Slot is not available' }, { status: 400 })
  }

  // Prevent double booking (overlap-based).
  const confirmedBookings = await prisma.booking.findMany({
    where: {
      eventTypeId: eventType.id,
      date: dateStringToUtcDate(date),
      status: 'confirmed',
    },
  })

  const overlaps = bookingBlockedRanges({
    bookings: confirmedBookings.map((b: any) => ({
      startTimeMinutes: timeOnlyToMinutes(b.startTime),
      endTimeMinutes: timeOnlyToMinutes(b.endTime),
    })),
    eventType: eventTypeDto,
  }).some((range) =>
    rangesOverlap(startMinutes, endMinutes, range.startTimeMinutes, range.endTimeMinutes)
  )

  if (overlaps) {
    return NextResponse.json({ error: 'Slot already booked' }, { status: 409 })
  }

  const created = await prisma.booking.create({
    data: {
      name,
      email,
      notes,
      date: dateStringToUtcDate(date),
      startTime: minutesToTimeOnlyDate(startMinutes),
      endTime: minutesToTimeOnlyDate(endMinutes),
      status: 'confirmed',
      eventTypeId: eventType.id,
      answers: {
        create: answers.map((answer) => ({
          bookingQuestionId: answer.questionId,
          value: answer.value,
        })),
      },
    },
    include: {
      eventType: true,
      answers: {
        include: {
          bookingQuestion: true,
        },
      },
      rescheduledTo: {
        select: { id: true },
      },
    },
  })

  await logNotification(prisma, {
    bookingId: created.id,
    recipient: email,
    subject: `Booking confirmed: ${eventType.title}`,
    type: 'booking_confirmed',
    payload: {
      eventSlug,
      date,
      startTime,
      notes,
    },
  })

  return NextResponse.json({ booking: bookingToDto(created) }, { status: 201 })
}

export async function DELETE(request: Request) {
  await getOrCreateDefaultUser()
  const prisma = getPrismaClient()
  if (!prisma) {
    const body = await request.json().catch(() => null)
    const parsed = CancelBookingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { id } = parsed.data

    const g = globalThis as unknown as {
      __aj_cal_mockBookings?: any[]
    }

    if (!g.__aj_cal_mockBookings) {
      g.__aj_cal_mockBookings = []
    }

    const idx = g.__aj_cal_mockBookings.findIndex((b) => b.id === id)
    if (idx === -1) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    g.__aj_cal_mockBookings[idx] = {
      ...g.__aj_cal_mockBookings[idx],
      status: 'cancelled' as const,
    }

    await logNotification(null, {
      bookingId: g.__aj_cal_mockBookings[idx].id,
      recipient: g.__aj_cal_mockBookings[idx].email,
      subject: 'Booking cancelled',
      type: 'booking_cancelled',
      payload: {
        date: g.__aj_cal_mockBookings[idx].date.toISOString().split('T')[0],
      },
    })

    return NextResponse.json({ booking: bookingToDto(g.__aj_cal_mockBookings[idx]) })
  }

  const body = await request.json().catch(() => null)
  const parsed = CancelBookingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { id } = parsed.data

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      eventType: true,
      answers: {
        include: {
          bookingQuestion: true,
        },
      },
      rescheduledTo: {
        select: { id: true },
      },
    },
  })

  if (!booking || booking.eventType.userId !== DEFAULT_USER_ID) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: 'cancelled' },
  })

  await logNotification(prisma, {
    bookingId: booking.id,
    recipient: booking.email,
    subject: 'Booking cancelled',
    type: 'booking_cancelled',
    payload: {
      date: booking.date.toISOString().split('T')[0],
      eventType: booking.eventType.title,
    },
  })

  return NextResponse.json({ booking: bookingToDto({ ...updated, eventType: booking.eventType }) })
}

