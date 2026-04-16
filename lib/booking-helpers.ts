import { formatMinutesToHHMM, parseHHMMToMinutes, type AvailabilityRange } from './slots'
import { mockAvailability, mockAvailabilitySchedules, mockDateOverrides, mockEventTypes } from './mock-data'
import { DEFAULT_USER_ID } from './prisma'
import type { AvailabilitySchedule, BookingQuestion, DateOverride, EventType } from './types'

export const DEFAULT_TIMEZONE = 'America/New_York'

export const DAY_NAME_TO_DAY_OF_WEEK: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
}

export function dateStringToUtcDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00.000Z`)
}

export function timeOnlyToMinutes(date: Date) {
  return date.getUTCHours() * 60 + date.getUTCMinutes()
}

export function minutesToTimeOnlyDate(minutes: number) {
  const hh = Math.floor(minutes / 60)
  const mm = minutes % 60
  return new Date(Date.UTC(1970, 0, 1, hh, mm, 0))
}

export function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && aEnd > bStart
}

export function parseQuestionOptions(optionsJson?: string | null) {
  if (!optionsJson) return undefined
  try {
    const parsed = JSON.parse(optionsJson)
    return Array.isArray(parsed) ? parsed : undefined
  } catch {
    return undefined
  }
}

export function buildMockEventTypeStore() {
  const g = globalThis as unknown as {
    mockEventTypes?: Array<EventType & { userId: string }>
  }
  if (!g.mockEventTypes) {
    g.mockEventTypes = mockEventTypes.map((et) => ({
      ...et,
      bufferBeforeMinutes: et.bufferBeforeMinutes ?? 0,
      bufferAfterMinutes: et.bufferAfterMinutes ?? 0,
      questions: et.questions ?? [],
      userId: DEFAULT_USER_ID,
    }))
  }
  return g.mockEventTypes
}

export function buildMockAvailabilityStore() {
  return getActiveMockAvailability()
}

export function getMockAvailabilitySchedules() {
  const g = globalThis as unknown as {
    __aj_cal_mockAvailabilitySchedules?: Array<{
      id: string
      name: string
      isActive: boolean
      availability: Array<{
        dayOfWeek: number
        enabled: boolean
        ranges: Array<{ startTime: string; endTime: string }>
      }>
    }>
    __aj_cal_mockTimezone?: string
    __aj_cal_mockAvailability?: Array<{
      dayOfWeek: number
      enabled: boolean
      ranges: Array<{ startTime: string; endTime: string }>
    }>
  }
  if (!g.__aj_cal_mockAvailabilitySchedules) {
    g.__aj_cal_mockAvailabilitySchedules = mockAvailabilitySchedules.map((schedule) => ({
      id: schedule.id,
      name: schedule.name,
      isActive: schedule.isActive,
      availability: schedule.availability.map((day) => {
        const dayOfWeek = DAY_NAME_TO_DAY_OF_WEEK[day.day]
        return {
          dayOfWeek,
          enabled: Boolean(day.enabled),
          ranges: day.enabled
            ? day.slots.map((slot) => ({
                startTime: slot.start,
                endTime: slot.end,
              }))
            : [],
        }
      }),
    }))
  }
  if (!g.__aj_cal_mockTimezone) {
    g.__aj_cal_mockTimezone = DEFAULT_TIMEZONE
  }
  const active = g.__aj_cal_mockAvailabilitySchedules.find((schedule) => schedule.isActive)
  g.__aj_cal_mockAvailability = active?.availability ?? g.__aj_cal_mockAvailabilitySchedules[0]?.availability ?? []
  return g.__aj_cal_mockAvailabilitySchedules
}

export function getActiveMockAvailability() {
  const schedules = getMockAvailabilitySchedules()
  return schedules.find((schedule) => schedule.isActive)?.availability ?? schedules[0]?.availability ?? []
}

export function setMockAvailabilitySchedules(
  schedules: Array<{
    id: string
    name: string
    isActive: boolean
    availability: Array<{
      dayOfWeek: number
      enabled: boolean
      ranges: Array<{ startTime: string; endTime: string }>
    }>
  }>
) {
  const g = globalThis as unknown as {
    __aj_cal_mockAvailabilitySchedules?: typeof schedules
    __aj_cal_mockAvailability?: Array<{
      dayOfWeek: number
      enabled: boolean
      ranges: Array<{ startTime: string; endTime: string }>
    }>
  }
  g.__aj_cal_mockAvailabilitySchedules = schedules
  g.__aj_cal_mockAvailability =
    schedules.find((schedule) => schedule.isActive)?.availability ?? schedules[0]?.availability ?? []
}

export function mapAvailabilityRowsToSchedules(rows: Array<any>, activeScheduleName: string): AvailabilitySchedule[] {
  const bySchedule = new Map<string, Array<any>>()
  for (const row of rows) {
    const key = row.scheduleName ?? 'Default Schedule'
    const existing = bySchedule.get(key) ?? []
    existing.push(row)
    bySchedule.set(key, existing)
  }

  return Array.from(bySchedule.entries()).map(([name, scheduleRows], index) => ({
    id: `${name}-${index}`,
    name,
    isActive: name === activeScheduleName,
    availability: Array.from({ length: 7 }).map((_, dayOfWeek) => {
      const dayRows = scheduleRows.filter((row) => row.dayOfWeek === dayOfWeek)
      const dayName = Object.keys(DAY_NAME_TO_DAY_OF_WEEK).find((key) => DAY_NAME_TO_DAY_OF_WEEK[key] === dayOfWeek) ?? 'Monday'
      return {
        day: dayName,
        enabled: dayRows.length > 0,
        slots: dayRows.map((row, slotIndex) => ({
          id: `${name}-${dayOfWeek}-${slotIndex}`,
          start: `${row.startTime.getUTCHours().toString().padStart(2, '0')}:${row.startTime.getUTCMinutes().toString().padStart(2, '0')}`,
          end: `${row.endTime.getUTCHours().toString().padStart(2, '0')}:${row.endTime.getUTCMinutes().toString().padStart(2, '0')}`,
        })),
      }
    }),
  }))
}

export function buildMockDateOverrideStore() {
  const g = globalThis as unknown as {
    __aj_cal_mockDateOverrides?: DateOverride[]
  }
  if (!g.__aj_cal_mockDateOverrides) {
    g.__aj_cal_mockDateOverrides = [...mockDateOverrides]
  }
  return g.__aj_cal_mockDateOverrides
}

export function getMockTimezone() {
  const g = globalThis as unknown as {
    __aj_cal_mockTimezone?: string
  }
  if (!g.__aj_cal_mockTimezone) {
    g.__aj_cal_mockTimezone = DEFAULT_TIMEZONE
  }
  return g.__aj_cal_mockTimezone
}

export function setMockTimezone(timezone: string) {
  const g = globalThis as unknown as {
    __aj_cal_mockTimezone?: string
  }
  g.__aj_cal_mockTimezone = timezone
}

export function mapDbEventTypeToDto(eventType: any): EventType & { userId?: string } {
  return {
    id: eventType.id,
    title: eventType.title,
    description: eventType.description,
    duration: eventType.duration,
    slug: eventType.slug,
    color: eventType.color ?? 'bg-blue-500',
    bufferBeforeMinutes: eventType.bufferBeforeMinutes ?? 0,
    bufferAfterMinutes: eventType.bufferAfterMinutes ?? 0,
    questions: (eventType.bookingQuestions ?? [])
      .slice()
      .sort((a: any, b: any) => a.position - b.position)
      .map((q: any): BookingQuestion => ({
        id: q.id,
        label: q.label,
        type: q.type,
        required: q.required,
        options: parseQuestionOptions(q.optionsJson),
      })),
  }
}

export function getOverrideForDate(
  overrides: Array<{
    date: string
    blocked: boolean
    slots: Array<{ start: string; end: string }>
  }>,
  date: string
) {
  return overrides.find((override) => override.date === date) ?? null
}

function getTimeZoneParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date)

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value])
  ) as Record<string, string>

  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
  }
}

export function getCurrentDateStringInTimezone(timeZone: string, now = new Date()) {
  const parts = getTimeZoneParts(now, timeZone)
  return `${parts.year}-${parts.month}-${parts.day}`
}

export function getCurrentMinutesInTimezone(timeZone: string, now = new Date()) {
  const parts = getTimeZoneParts(now, timeZone)
  return Number(parts.hour) * 60 + Number(parts.minute)
}

export function getDayOfWeekFromDateString(dateStr: string) {
  return new Date(`${dateStr}T12:00:00.000Z`).getUTCDay()
}

export function isSlotInPast(params: {
  date: string
  startMinutes: number
  timeZone: string
  now?: Date
}) {
  const currentDate = getCurrentDateStringInTimezone(params.timeZone, params.now)
  if (params.date < currentDate) return true
  if (params.date > currentDate) return false
  return params.startMinutes < getCurrentMinutesInTimezone(params.timeZone, params.now)
}

export function availabilityRangesFromWeeklyAndOverrides(params: {
  weeklyRanges: Array<{ startTime: string; endTime: string }>
  override: { blocked: boolean; slots: Array<{ start: string; end: string }> } | null
}): AvailabilityRange[] {
  if (params.override?.blocked) return []

  const sourceRanges = params.override
    ? params.override.slots.map((slot) => ({
        startTime: slot.start,
        endTime: slot.end,
      }))
    : params.weeklyRanges

  return sourceRanges
    .map((range) => ({
      startTimeMinutes: parseHHMMToMinutes(range.startTime),
      endTimeMinutes: parseHHMMToMinutes(range.endTime),
    }))
    .filter((range) => range.startTimeMinutes < range.endTimeMinutes)
}

export function bookingBlockedRanges(params: {
  bookings: Array<{ startTimeMinutes: number; endTimeMinutes: number }>
  eventType: Pick<EventType, 'bufferBeforeMinutes' | 'bufferAfterMinutes'>
}): Array<{ startTimeMinutes: number; endTimeMinutes: number }> {
  return params.bookings.map((booking) => ({
    startTimeMinutes:
      booking.startTimeMinutes - (params.eventType.bufferBeforeMinutes ?? 0),
    endTimeMinutes:
      booking.endTimeMinutes + (params.eventType.bufferAfterMinutes ?? 0),
  }))
}

export function formatBookingTimeRange(startMinutes: number, endMinutes: number) {
  return {
    startTime: formatMinutesToHHMM(startMinutes),
    endTime: formatMinutesToHHMM(endMinutes),
  }
}
