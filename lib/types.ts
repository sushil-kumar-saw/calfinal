export interface EventType {
  id: string
  title: string
  description: string
  duration: number
  slug: string
  color: string
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

export interface Booking {
  id: string
  guestName: string
  guestEmail: string
  eventType: string
  date: string
  time: string
  status: 'upcoming' | 'past' | 'cancelled'
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}
