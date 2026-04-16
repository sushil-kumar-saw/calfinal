import { NextResponse } from 'next/server'
import {
  DEFAULT_TIMEZONE,
  getMockTimezone,
  getMockAvailabilitySchedules,
  mapAvailabilityRowsToSchedules,
  setMockAvailabilitySchedules,
  setMockTimezone,
} from '@/lib/booking-helpers'
import { DEFAULT_USER_ID, getOrCreateDefaultUser, getPrismaClient } from '@/lib/prisma'
import { parseHHMMToMinutes } from '@/lib/slots'
import type { AvailabilitySchedule } from '@/lib/types'

export const runtime = 'nodejs'

const DAY_NAME_TO_DAY_OF_WEEK: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
}

function pad2(n: number) {
  return n.toString().padStart(2, '0')
}

function dateTimeToHHMM(date: Date) {
  // Time-only fields are stored as a Date anchored to an arbitrary day in UTC.
  return `${pad2(date.getUTCHours())}:${pad2(date.getUTCMinutes())}`
}

function minutesToTimeOnlyDate(minutes: number) {
  const hh = Math.floor(minutes / 60)
  const mm = minutes % 60
  return new Date(Date.UTC(1970, 0, 1, hh, mm, 0))
}

function parseIncomingRanges(dayEntry: any): Array<{ startTime: string; endTime: string }> {
  if (Array.isArray(dayEntry?.ranges)) {
    return dayEntry.ranges
      .map((r: any) => ({
        startTime: r.startTime,
        endTime: r.endTime,
      }))
      .filter((r: any) => typeof r.startTime === 'string' && typeof r.endTime === 'string')
  }

  // Frontend's shape: slots: [{ start, end }]
  if (Array.isArray(dayEntry?.slots)) {
    return dayEntry.slots
      .map((s: any) => ({
        startTime: s.start,
        endTime: s.end,
      }))
      .filter((r: any) => typeof r.startTime === 'string' && typeof r.endTime === 'string')
  }

  return []
}

function flattenScheduleToApiAvailability(schedule: AvailabilitySchedule | null) {
  return Array.from({ length: 7 }).map((_, dayOfWeek) => {
    const dayName = Object.keys(DAY_NAME_TO_DAY_OF_WEEK).find((key) => DAY_NAME_TO_DAY_OF_WEEK[key] === dayOfWeek)
    const day = schedule?.availability.find((item) => item.day === dayName)
    return {
      dayOfWeek,
      enabled: day?.enabled ?? false,
      ranges: (day?.slots ?? []).map((slot) => ({
        startTime: slot.start,
        endTime: slot.end,
      })),
    }
  })
}

function normalizeIncomingSchedules(input: any): Array<{
  id?: string
  name: string
  isActive: boolean
  availability: any[]
}> {
  if (Array.isArray(input?.schedules)) {
    return input.schedules
  }

  return [
    {
      id: 'default',
      name: input?.activeScheduleName ?? 'Default Schedule',
      isActive: true,
      availability: Array.isArray(input?.availability) ? input.availability : [],
    },
  ]
}

export async function GET() {
  await getOrCreateDefaultUser()
  const prisma = getPrismaClient()
  if (!prisma) {
    const schedules = getMockAvailabilitySchedules().map((schedule) => ({
      id: schedule.id,
      name: schedule.name,
      isActive: schedule.isActive,
      availability: Array.from({ length: 7 }).map((_, dayOfWeek) => {
        const dayData = schedule.availability.find((day) => day.dayOfWeek === dayOfWeek)
        return {
          dayOfWeek,
          enabled: dayData?.enabled ?? false,
          ranges: dayData?.ranges ?? [],
        }
      }),
    }))
    const activeSchedule = schedules.find((schedule) => schedule.isActive) ?? schedules[0] ?? null

    return NextResponse.json({
      availability: activeSchedule?.availability ?? [],
      schedules,
      activeScheduleName: activeSchedule?.name ?? 'Default Schedule',
      timezone: getMockTimezone(),
    })
  }

  const user = await prisma.user.findUnique({
    where: { id: DEFAULT_USER_ID },
    select: { timezone: true, activeAvailabilitySchedule: true },
  })
  const rows = await prisma.availability.findMany({
    where: { userId: DEFAULT_USER_ID },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  })

  const schedules = mapAvailabilityRowsToSchedules(rows, user?.activeAvailabilitySchedule ?? 'Default Schedule')
  const activeSchedule = schedules.find((schedule) => schedule.isActive) ?? schedules[0] ?? null
  const availability = flattenScheduleToApiAvailability(activeSchedule)

  return NextResponse.json({
    availability,
    schedules: schedules.map((schedule) => ({
      id: schedule.id,
      name: schedule.name,
      isActive: schedule.isActive,
      availability: flattenScheduleToApiAvailability(schedule),
    })),
    activeScheduleName: activeSchedule?.name ?? 'Default Schedule',
    timezone: user?.timezone ?? DEFAULT_TIMEZONE,
  })
}

export async function PUT(request: Request) {
  await getOrCreateDefaultUser()
  const prisma = getPrismaClient()
  if (!prisma) {
    const body = await request.json().catch(() => null)
    const timezone = typeof body?.timezone === 'string' ? body.timezone : getMockTimezone()
    const schedules = normalizeIncomingSchedules(body)
    if (!schedules.length) {
      return NextResponse.json({ error: 'Expected availability schedules' }, { status: 400 })
    }
    const activeScheduleName =
      typeof body?.activeScheduleName === 'string'
        ? body.activeScheduleName
        : schedules.find((schedule) => schedule.isActive)?.name ?? schedules[0].name

    const normalizedSchedules = schedules.map((schedule, scheduleIndex) => {
      const nextAvailability = Array.from({ length: 7 }).map((_, dayOfWeek) => ({
        dayOfWeek,
        enabled: false,
        ranges: [] as Array<{ startTime: string; endTime: string }>,
      }))

      for (const dayEntry of schedule.availability ?? []) {
        const enabled = dayEntry?.enabled === undefined ? true : Boolean(dayEntry.enabled)
        const ranges = parseIncomingRanges(dayEntry)

        let dayOfWeek: number | undefined = undefined
        if (typeof dayEntry?.dayOfWeek === 'number') dayOfWeek = dayEntry.dayOfWeek
        else if (typeof dayEntry?.day === 'string') {
          dayOfWeek = DAY_NAME_TO_DAY_OF_WEEK[dayEntry.day]
        }

        if (dayOfWeek === undefined || dayOfWeek < 0 || dayOfWeek > 6) {
          continue
        }

        if (!enabled) continue
        if (ranges.length === 0) continue

        const normalizedRanges = []
        for (const r of ranges) {
          try {
            const startMinutes = parseHHMMToMinutes(r.startTime)
            const endMinutes = parseHHMMToMinutes(r.endTime)
            if (startMinutes >= endMinutes) continue
            normalizedRanges.push({ startTime: r.startTime, endTime: r.endTime })
          } catch {
            // Ignore invalid ranges in mock mode.
          }
        }

        nextAvailability[dayOfWeek] = {
          dayOfWeek,
          enabled: normalizedRanges.length > 0,
          ranges: normalizedRanges,
        }
      }

      return {
        id: schedule.id ?? `schedule-${scheduleIndex}`,
        name: schedule.name,
        isActive: schedule.name === activeScheduleName,
        availability: nextAvailability,
      }
    })

    setMockAvailabilitySchedules(normalizedSchedules)
    setMockTimezone(timezone)

    return NextResponse.json({ ok: true, timezone, activeScheduleName })
  }

  const body = await request.json().catch(() => null)
  const timezone = typeof body?.timezone === 'string' ? body.timezone : DEFAULT_TIMEZONE
  const schedules = normalizeIncomingSchedules(body)
  if (!schedules.length) {
    return NextResponse.json({ error: 'Expected availability schedules' }, { status: 400 })
  }
  const activeScheduleName =
    typeof body?.activeScheduleName === 'string'
      ? body.activeScheduleName
      : schedules.find((schedule) => schedule.isActive)?.name ?? schedules[0].name

  // Replace full weekly availability.
  await prisma.availability.deleteMany({ where: { userId: DEFAULT_USER_ID } })

  const createData: Array<{
    dayOfWeek: number
    startTime: Date
    endTime: Date
    scheduleName: string
  }> = []

  for (const schedule of schedules) {
    for (const dayEntry of schedule.availability ?? []) {
      const enabled =
        dayEntry?.enabled === undefined ? true : Boolean(dayEntry.enabled)

      const ranges = parseIncomingRanges(dayEntry)
      if (!enabled || ranges.length === 0) continue

      let dayOfWeek: number | undefined = undefined
      if (typeof dayEntry?.dayOfWeek === 'number') dayOfWeek = dayEntry.dayOfWeek
      else if (typeof dayEntry?.day === 'string') {
        dayOfWeek = DAY_NAME_TO_DAY_OF_WEEK[dayEntry.day]
      }

      if (dayOfWeek === undefined || dayOfWeek < 0 || dayOfWeek > 6) {
        return NextResponse.json({ error: `Invalid day: ${dayEntry?.day ?? dayEntry?.dayOfWeek}` }, { status: 400 })
      }

      for (const r of ranges) {
        const startMinutes = parseHHMMToMinutes(r.startTime)
        const endMinutes = parseHHMMToMinutes(r.endTime)
        if (startMinutes >= endMinutes) continue

        createData.push({
          dayOfWeek,
          startTime: minutesToTimeOnlyDate(startMinutes),
          endTime: minutesToTimeOnlyDate(endMinutes),
          scheduleName: schedule.name,
        })
      }
    }
  }

  if (createData.length) {
    await prisma.availability.createMany({
      data: createData.map((d) => ({
        dayOfWeek: d.dayOfWeek,
        startTime: d.startTime,
        endTime: d.endTime,
        scheduleName: d.scheduleName,
        userId: DEFAULT_USER_ID,
      })),
    })
  }

  await prisma.user.update({
    where: { id: DEFAULT_USER_ID },
    data: { timezone, activeAvailabilitySchedule: activeScheduleName },
  })

  return NextResponse.json({ ok: true, timezone, activeScheduleName })
}

