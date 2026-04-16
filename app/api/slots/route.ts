import { z } from 'zod'
import { NextResponse } from 'next/server'
import { DEFAULT_USER_ID, getOrCreateDefaultUser, getPrismaClient } from '@/lib/prisma'
import { generateAvailableSlots, type BookingRange } from '@/lib/slots'
import {
  availabilityRangesFromWeeklyAndOverrides,
  bookingBlockedRanges,
  buildMockAvailabilityStore,
  buildMockDateOverrideStore,
  buildMockEventTypeStore,
  dateStringToUtcDate,
  getCurrentDateStringInTimezone,
  getCurrentMinutesInTimezone,
  getDayOfWeekFromDateString,
  getMockTimezone,
  getOverrideForDate,
  mapDbEventTypeToDto,
  timeOnlyToMinutes,
} from '@/lib/booking-helpers'

export const runtime = 'nodejs'

const SlotsRequestSchema = z.object({
  eventSlug: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  excludeBookingId: z.string().optional(),
})

export async function POST(request: Request) {
  await getOrCreateDefaultUser()
  const prisma = getPrismaClient()
  if (!prisma) {
    const body = await request.json().catch(() => null)
    const parsed = SlotsRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { eventSlug, date } = parsed.data

    const g = globalThis as unknown as {
      __aj_cal_mockBookings?: Array<{
        id: string
        eventTypeId: string
        date: Date
        startTime: Date
        endTime: Date
        rescheduledFromId?: string | null
        status: 'confirmed' | 'cancelled'
      }>
    }

    const eventType = buildMockEventTypeStore().find((et) => et.slug === eventSlug && et.userId === DEFAULT_USER_ID) ?? null
    if (!eventType) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const timezone = getMockTimezone()
    const dayOfWeek = getDayOfWeekFromDateString(date)
    const dayAvailability = buildMockAvailabilityStore().find((d) => d.dayOfWeek === dayOfWeek) ?? null
    const override = getOverrideForDate(buildMockDateOverrideStore(), date)

    // Overrides should be able to open availability even if the weekly day is disabled.
    if (!dayAvailability?.enabled && !override) {
      return NextResponse.json({ slots: [] })
    }

    const availabilityRanges = availabilityRangesFromWeeklyAndOverrides({
      weeklyRanges: dayAvailability?.ranges ?? [],
      override,
    })
    if (availabilityRanges.length === 0) {
      return NextResponse.json({ slots: [] })
    }

    const confirmedBookings = (g.__aj_cal_mockBookings ?? []).filter((b) => {
      const sameDate = b.date.toISOString().split('T')[0] === date
      return (
        b.eventTypeId === eventType.id &&
        sameDate &&
        b.status === 'confirmed' &&
        b.id !== parsed.data.excludeBookingId
      )
    })

    const bookedRanges: BookingRange[] = bookingBlockedRanges({
      bookings: confirmedBookings.map((b) => ({
        startTimeMinutes: timeOnlyToMinutes(b.startTime),
        endTimeMinutes: timeOnlyToMinutes(b.endTime),
      })),
      eventType,
    })

    const slots = generateAvailableSlots({
      date,
      durationMinutes: eventType.duration,
      availabilityRanges,
      bookedRanges,
      now: new Date(),
      currentDateString: getCurrentDateStringInTimezone(timezone),
      currentMinutes: getCurrentMinutesInTimezone(timezone),
      stepMinutes: 30,
    })

    return NextResponse.json({ slots })
  }

  const body = await request.json().catch(() => null)
  const parsed = SlotsRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { eventSlug, date } = parsed.data

  const eventType = await prisma.eventType.findUnique({
    where: { slug: eventSlug },
    include: {
      bookingQuestions: true,
    },
  })

  if (!eventType || eventType.userId !== DEFAULT_USER_ID) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  const eventTypeDto = mapDbEventTypeToDto(eventType)

  const user = await prisma.user.findUnique({
    where: { id: DEFAULT_USER_ID },
    select: { timezone: true, activeAvailabilitySchedule: true },
  })
  const timezone = user?.timezone ?? 'America/New_York'
  const activeScheduleName = user?.activeAvailabilitySchedule ?? 'Default Schedule'

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
  if (availabilityRanges.length === 0) {
    return NextResponse.json({ slots: [] })
  }

  const dateForDb = dateStringToUtcDate(date)
  const confirmedBookings = await prisma.booking.findMany({
    where: {
      eventTypeId: eventType.id,
      date: dateForDb,
      status: 'confirmed',
      ...(parsed.data.excludeBookingId
        ? {
            id: {
              not: parsed.data.excludeBookingId,
            },
          }
        : {}),
    },
  })

  const bookedRanges: BookingRange[] = bookingBlockedRanges({
    bookings: confirmedBookings.map((b: any) => ({
      startTimeMinutes: timeOnlyToMinutes(b.startTime),
      endTimeMinutes: timeOnlyToMinutes(b.endTime),
    })),
    eventType: eventTypeDto,
  })

  const slots = generateAvailableSlots({
    date,
    durationMinutes: eventType.duration,
    availabilityRanges,
    bookedRanges,
    now: new Date(),
    currentDateString: getCurrentDateStringInTimezone(timezone),
    currentMinutes: getCurrentMinutesInTimezone(timezone),
    stepMinutes: 30, // align with existing UI logic
  })

  return NextResponse.json({ slots })
}

// Also support GET with query params for flexibility.
export async function GET(request: Request) {
  const url = new URL(request.url)
  const eventSlug = url.searchParams.get('eventSlug')
  const date = url.searchParams.get('date')
  if (!eventSlug || !date) {
    return NextResponse.json({ error: 'Missing eventSlug or date' }, { status: 400 })
  }

  return POST(
    new Request(url.toString(), {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify({ eventSlug, date }),
    })
  )
}

