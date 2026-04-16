export interface EventType {
  id: string
  title: string
  description: string
  duration: number
  slug: string
  color: string
  bufferBeforeMinutes?: number
  bufferAfterMinutes?: number
  questions?: BookingQuestion[]
}

export interface TimeSlot {
  id: string
  start: string
  end: string
}

export interface DayAvailability {
  day: string
  enabled: boolean
  slots: TimeSlot[]
}

export interface AvailabilitySchedule {
  id: string
  name: string
  isActive: boolean
  availability: DayAvailability[]
}

export interface DateOverride {
  id: string
  date: string
  blocked: boolean
  slots: TimeSlot[]
}

export interface BookingQuestionOption {
  label: string
  value: string
}

export interface BookingQuestion {
  id: string
  label: string
  type: 'short_text' | 'long_text' | 'select'
  required: boolean
  options?: BookingQuestionOption[]
}

export interface BookingAnswer {
  questionId: string
  questionLabel: string
  value: string
}

export interface Booking {
  id: string
  guestName: string
  guestEmail: string
  eventType: string
  date: string
  time: string
  status: 'upcoming' | 'past' | 'cancelled'
  eventTypeId?: string
  eventSlug?: string
  startTime?: string
  endTime?: string
  notes?: string
  answers?: BookingAnswer[]
  rescheduledFromId?: string | null
  rescheduledToId?: string | null
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}
