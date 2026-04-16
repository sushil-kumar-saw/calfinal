import { z } from 'zod'
import { NextResponse } from 'next/server'
import { logNotification } from '@/lib/notifications'
import {
  availabilityRangesFromWeeklyAndOverrides,
  bookingBlockedRanges,
  buildMockAvailabilityStore,
  buildMockDateOverrideStore,
  buildMockEventTypeStore,
  dateStringToUtcDate,
  getOverrideForDate,
  mapDbEventTypeToDto,
  minutesToTimeOnlyDate,
  rangesOverlap,
  timeOnlyToMinutes,
} from '@/lib/booking-helpers'
import { DEFAULT_USER_ID, getOrCreateDefaultUser, getPrismaClient } from '@/lib/prisma'
import { parseHHMMToMinutes } from '@/lib/slots'

export const runtime = 'nodejs'

const RescheduleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await getOrCreateDefaultUser()
  const prisma = getPrismaClient()
  const body = await request.json().catch(() => null)
  const parsed = RescheduleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { date, startTime } = parsed.data

  if (!prisma) {
    const g = globalThis as unknown as {
      __aj_cal_mockBookings?: any[]
    }
    const bookings = g.__aj_cal_mockBookings ?? []
    const booking = bookings.find((item) => item.id === id)
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const eventType =
      buildMockEventTypeStore().find((item) => item.id === booking.eventTypeId) ??
      buildMockEventTypeStore().find((item) => item.slug === booking.eventSlug)
    if (!eventType) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const durationMinutes =
      timeOnlyToMinutes(booking.endTime) - timeOnlyToMinutes(booking.startTime)
    const nextStartMinutes = parseHHMMToMinutes(startTime)
    const nextEndMinutes = nextStartMinutes + durationMinutes

    const dayOfWeek = dateStringToUtcDate(date).getUTCDay()
    const dayAvailability = buildMockAvailabilityStore().find((d) => d.dayOfWeek === dayOfWeek)
    const override = getOverrideForDate(buildMockDateOverrideStore(), date)
    const ranges = availabilityRangesFromWeeklyAndOverrides({
      weeklyRanges: dayAvailability?.ranges ?? [],
      override,
    })
    const fitsAvailability = ranges.some(
      (range) => nextStartMinutes >= range.startTimeMinutes && nextEndMinutes <= range.endTimeMinutes
    )
    if (!fitsAvailability) {
      return NextResponse.json({ error: 'Slot is not available' }, { status: 400 })
    }

    const blockedRanges = bookingBlockedRanges({
      bookings: bookings
        .filter(
          (item) =>
            item.id !== id &&
            item.eventTypeId === booking.eventTypeId &&
            item.status === 'confirmed' &&
            item.date.toISOString().split('T')[0] === date
        )
        .map((item) => ({
          startTimeMinutes: timeOnlyToMinutes(item.startTime),
          endTimeMinutes: timeOnlyToMinutes(item.endTime),
        })),
      eventType,
    })

    const overlaps = blockedRanges.some((range) =>
      rangesOverlap(nextStartMinutes, nextEndMinutes, range.startTimeMinutes, range.endTimeMinutes)
    )
    if (overlaps) {
      return NextResponse.json({ error: 'Slot already booked' }, { status: 409 })
    }

    const newBooking = {
      ...booking,
      id: `mock_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      date: dateStringToUtcDate(date),
      startTime: minutesToTimeOnlyDate(nextStartMinutes),
      endTime: minutesToTimeOnlyDate(nextEndMinutes),
      createdAt: new Date(),
      status: 'confirmed',
      rescheduledFromId: id,
      rescheduledTo: [],
    }
    booking.status = 'rescheduled'
    booking.rescheduledTo = [{ id: newBooking.id }]
    bookings.push(newBooking)

    await logNotification(null, {
      bookingId: newBooking.id,
      recipient: newBooking.email,
      subject: 'Booking rescheduled',
      type: 'booking_rescheduled',
      payload: {
        previousBookingId: id,
        newDate: date,
        newStartTime: startTime,
      },
    })

    return NextResponse.json({ booking: newBooking })
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      eventType: {
        include: {
          bookingQuestions: true,
        },
      },
      answers: true,
    },
  })
  if (!booking || booking.eventType.userId !== DEFAULT_USER_ID) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  const eventType = mapDbEventTypeToDto(booking.eventType)
  const durationMinutes =
    timeOnlyToMinutes(booking.endTime) - timeOnlyToMinutes(booking.startTime)
  const nextStartMinutes = parseHHMMToMinutes(startTime)
  const nextEndMinutes = nextStartMinutes + durationMinutes

  const user = await prisma.user.findUnique({
    where: { id: DEFAULT_USER_ID },
    select: { activeAvailabilitySchedule: true },
  })
  const activeScheduleName = user?.activeAvailabilitySchedule ?? 'Default Schedule'

  const dayOfWeek = dateStringToUtcDate(date).getUTCDay()
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
          blocked: overrideRows.some((row) => row.blocked),
          slots: overrideRows
            .filter((row) => !row.blocked && row.startTime && row.endTime)
            .map((row) => ({
              start: `${row.startTime!.getUTCHours().toString().padStart(2, '0')}:${row.startTime!.getUTCMinutes().toString().padStart(2, '0')}`,
              end: `${row.endTime!.getUTCHours().toString().padStart(2, '0')}:${row.endTime!.getUTCMinutes().toString().padStart(2, '0')}`,
            })),
        }

  const availabilityRanges = availabilityRangesFromWeeklyAndOverrides({
    weeklyRanges: availabilityRows.map((row) => ({
      startTime: `${row.startTime.getUTCHours().toString().padStart(2, '0')}:${row.startTime.getUTCMinutes().toString().padStart(2, '0')}`,
      endTime: `${row.endTime.getUTCHours().toString().padStart(2, '0')}:${row.endTime.getUTCMinutes().toString().padStart(2, '0')}`,
    })),
    override,
  })

  const fitsAvailability = availabilityRanges.some(
    (range) => nextStartMinutes >= range.startTimeMinutes && nextEndMinutes <= range.endTimeMinutes
  )
  if (!fitsAvailability) {
    return NextResponse.json({ error: 'Slot is not available' }, { status: 400 })
  }

  const sameDayConfirmed = await prisma.booking.findMany({
    where: {
      eventTypeId: booking.eventTypeId,
      date: dateStringToUtcDate(date),
      status: 'confirmed',
      id: { not: id },
    },
  })

  const blockedRanges = bookingBlockedRanges({
    bookings: sameDayConfirmed.map((item) => ({
      startTimeMinutes: timeOnlyToMinutes(item.startTime),
      endTimeMinutes: timeOnlyToMinutes(item.endTime),
    })),
    eventType,
  })

  const overlaps = blockedRanges.some((range) =>
    rangesOverlap(nextStartMinutes, nextEndMinutes, range.startTimeMinutes, range.endTimeMinutes)
  )
  if (overlaps) {
    return NextResponse.json({ error: 'Slot already booked' }, { status: 409 })
  }

  const created = await prisma.booking.create({
    data: {
      name: booking.name,
      email: booking.email,
      notes: booking.notes,
      date: dateStringToUtcDate(date),
      startTime: minutesToTimeOnlyDate(nextStartMinutes),
      endTime: minutesToTimeOnlyDate(nextEndMinutes),
      status: 'confirmed',
      eventTypeId: booking.eventTypeId,
      rescheduledFromId: booking.id,
      answers: {
        create: booking.answers.map((answer) => ({
          bookingQuestionId: answer.bookingQuestionId,
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

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: 'rescheduled' },
  })

  await logNotification(prisma, {
    bookingId: created.id,
    recipient: created.email,
    subject: 'Booking rescheduled',
    type: 'booking_rescheduled',
    payload: {
      previousBookingId: booking.id,
      newDate: date,
      newStartTime: startTime,
    },
  })

  return NextResponse.json({ booking: created })
}
