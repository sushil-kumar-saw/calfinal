import { z } from 'zod'
import { NextResponse } from 'next/server'
import { buildMockDateOverrideStore, dateStringToUtcDate, minutesToTimeOnlyDate } from '@/lib/booking-helpers'
import { DEFAULT_USER_ID, getOrCreateDefaultUser, getPrismaClient } from '@/lib/prisma'
import { parseHHMMToMinutes } from '@/lib/slots'

export const runtime = 'nodejs'

const OverrideSlotSchema = z.object({
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
})

const DateOverrideSchema = z.object({
  id: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  blocked: z.boolean().default(false),
  slots: z.array(OverrideSlotSchema).default([]),
})

function dbOverrideToDto(row: any) {
  return {
    id: row.id,
    date: row.date.toISOString().split('T')[0],
    blocked: row.blocked,
    slots:
      row.blocked || !row.startTime || !row.endTime
        ? []
        : [
            {
              id: row.id,
              start: `${row.startTime.getUTCHours().toString().padStart(2, '0')}:${row.startTime.getUTCMinutes().toString().padStart(2, '0')}`,
              end: `${row.endTime.getUTCHours().toString().padStart(2, '0')}:${row.endTime.getUTCMinutes().toString().padStart(2, '0')}`,
            },
          ],
  }
}

export async function GET() {
  await getOrCreateDefaultUser()
  const prisma = getPrismaClient()

  if (!prisma) {
    return NextResponse.json({ overrides: buildMockDateOverrideStore() })
  }

  const rows = await prisma.dateOverride.findMany({
    where: { userId: DEFAULT_USER_ID },
    orderBy: { date: 'asc' },
  })

  return NextResponse.json({ overrides: rows.map(dbOverrideToDto) })
}

export async function PUT(request: Request) {
  await getOrCreateDefaultUser()
  const prisma = getPrismaClient()
  const body = await request.json().catch(() => null)
  const input = body?.overrides ?? body
  if (!Array.isArray(input)) {
    return NextResponse.json({ error: 'Expected { overrides: [...] }' }, { status: 400 })
  }

  const parsed = z.array(DateOverrideSchema).safeParse(input)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  if (!prisma) {
    const store = buildMockDateOverrideStore()
    store.splice(
      0,
      store.length,
      ...parsed.data.map((item, index) => ({
        id: item.id ?? `override_${Date.now()}_${index}`,
        date: item.date,
        blocked: item.blocked,
        slots: item.blocked
          ? []
          : item.slots.map((slot, slotIndex) => ({
              id: `${item.id ?? index}-${slotIndex}`,
              start: slot.start,
              end: slot.end,
            })),
      })),
    )
    return NextResponse.json({ ok: true, overrides: store })
  }

  await prisma.dateOverride.deleteMany({
    where: { userId: DEFAULT_USER_ID },
  })

  const rows: Array<{
    date: Date
    blocked: boolean
    startTime: Date | null
    endTime: Date | null
    userId: string
  }> = []

  for (const item of parsed.data) {
    if (item.blocked || item.slots.length === 0) {
      rows.push({
        date: dateStringToUtcDate(item.date),
        blocked: item.blocked,
        startTime: null,
        endTime: null,
        userId: DEFAULT_USER_ID,
      })
      continue
    }

    for (const slot of item.slots) {
      rows.push({
        date: dateStringToUtcDate(item.date),
        blocked: false,
        startTime: minutesToTimeOnlyDate(parseHHMMToMinutes(slot.start)),
        endTime: minutesToTimeOnlyDate(parseHHMMToMinutes(slot.end)),
        userId: DEFAULT_USER_ID,
      })
    }
  }

  if (rows.length > 0) {
    await prisma.dateOverride.createMany({
      data: rows as any,
    })
  }

  const saved = await prisma.dateOverride.findMany({
    where: { userId: DEFAULT_USER_ID },
    orderBy: { date: 'asc' },
  })

  return NextResponse.json({ ok: true, overrides: saved.map(dbOverrideToDto) })
}
