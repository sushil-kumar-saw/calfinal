export type AvailabilityRange = {
  startTimeMinutes: number
  endTimeMinutes: number
}

export type BookingRange = {
  startTimeMinutes: number
  endTimeMinutes: number
}

export type GeneratedSlot = {
  startTime: string // HH:MM (24h)
  endTime: string // HH:MM (24h)
  displayTime: string // e.g. "10:00 AM"
}

const HHMM_REGEX = /^(\d{2}):(\d{2})$/

export function parseHHMMToMinutes(time: string) {
  const match = time.match(HHMM_REGEX)
  if (!match) throw new Error(`Invalid time format: ${time}`)
  const hh = Number(match[1])
  const mm = Number(match[2])
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) throw new Error(`Invalid time: ${time}`)
  return hh * 60 + mm
}

export function formatMinutesToHHMM(minutes: number) {
  const normalized = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60)
  const hh = Math.floor(normalized / 60)
  const mm = normalized % 60
  return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`
}

export function formatMinutesTo12h(minutes: number) {
  const hh24 = Math.floor(minutes / 60)
  const mm = minutes % 60
  const ampm = hh24 < 12 ? 'AM' : 'PM'
  const hh12 = hh24 % 12 === 0 ? 12 : hh24 % 12
  return `${hh12}:${mm.toString().padStart(2, '0')} ${ampm}`
}

function combineDateAndMinutesUtc(date: string, minutesFromMidnight: number) {
  // Treat date as a UTC day boundary so the same YYYY-MM-DD maps consistently.
  return new Date(`${date}T00:00:00.000Z`).getTime() + minutesFromMidnight * 60_000
}

function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  // Overlap for half-open intervals [start, end)
  return aStart < bEnd && aEnd > bStart
}

export function generateAvailableSlots(params: {
  date: string // YYYY-MM-DD
  durationMinutes: number
  availabilityRanges: AvailabilityRange[]
  stepMinutes?: number
  now?: Date
  bookedRanges?: BookingRange[]
  currentDateString?: string
  currentMinutes?: number
}): GeneratedSlot[] {
  const { date, durationMinutes, availabilityRanges } = params
  const stepMinutes = params.stepMinutes ?? 30
  const now = params.now ?? new Date()
  const bookedRanges = params.bookedRanges ?? []
  const currentDateString = params.currentDateString ?? now.toISOString().split('T')[0]
  const currentMinutes = params.currentMinutes ?? now.getUTCHours() * 60 + now.getUTCMinutes()

  if (!availabilityRanges.length) return []
  if (durationMinutes <= 0) return []

  const nowMs = now.getTime()
  const slots: GeneratedSlot[] = []

  for (const range of availabilityRanges) {
    let current = range.startTimeMinutes
    while (current + durationMinutes <= range.endTimeMinutes) {
      const slotStartMs = combineDateAndMinutesUtc(date, current)
      const slotEndMs = slotStartMs + durationMinutes * 60_000

      // Past-slot filtering (required for production behavior).
      const slotIsFutureOrCurrent =
        date > currentDateString ||
        (date === currentDateString && current >= currentMinutes)

      if (slotStartMs >= nowMs && slotIsFutureOrCurrent) {
        const slotOverlapsBooking = bookedRanges.some((b) =>
          rangesOverlap(current, current + durationMinutes, b.startTimeMinutes, b.endTimeMinutes)
        )

        if (!slotOverlapsBooking) {
          slots.push({
            startTime: formatMinutesToHHMM(current),
            endTime: formatMinutesToHHMM(current + durationMinutes),
            displayTime: formatMinutesTo12h(current),
          })
        }
      }

      current += stepMinutes
      // Prevent accidental infinite loops if someone configured stepMinutes=0.
      if (stepMinutes <= 0) break
      // Also guard against runaway due to invalid data.
      if (current > 24 * 60) break
    }
  }

  // Deduplicate by (startTime,endTime) in case multiple availability ranges overlap.
  const unique = new Map<string, GeneratedSlot>()
  for (const s of slots) unique.set(`${s.startTime}-${s.endTime}`, s)
  return Array.from(unique.values()).sort((a, b) => a.startTime.localeCompare(b.startTime))
}

