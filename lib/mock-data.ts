import type { EventType, DayAvailability, Booking, User } from './types'

export const mockUser: User = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  avatar: undefined,
}

export const mockEventTypes: EventType[] = [
  {
    id: '1',
    title: '15 Minute Meeting',
    description: 'A quick 15-minute call to discuss any topic.',
    duration: 15,
    slug: '15min',
    color: 'bg-blue-500',
  },
  {
    id: '2',
    title: '30 Minute Meeting',
    description: 'Standard meeting for discussions and consultations.',
    duration: 30,
    slug: '30min',
    color: 'bg-emerald-500',
  },
  {
    id: '3',
    title: '60 Minute Meeting',
    description: 'Extended session for in-depth discussions and presentations.',
    duration: 60,
    slug: '60min',
    color: 'bg-amber-500',
  },
]

export const mockAvailability: DayAvailability[] = [
  { day: 'Monday', enabled: true, slots: [{ id: '1', start: '09:00', end: '17:00' }] },
  { day: 'Tuesday', enabled: true, slots: [{ id: '2', start: '09:00', end: '17:00' }] },
  { day: 'Wednesday', enabled: true, slots: [{ id: '3', start: '09:00', end: '17:00' }] },
  { day: 'Thursday', enabled: true, slots: [{ id: '4', start: '09:00', end: '17:00' }] },
  { day: 'Friday', enabled: true, slots: [{ id: '5', start: '09:00', end: '17:00' }] },
  { day: 'Saturday', enabled: false, slots: [] },
  { day: 'Sunday', enabled: false, slots: [] },
]

export const mockBookings: Booking[] = [
  {
    id: '1',
    guestName: 'Sarah Miller',
    guestEmail: 'sarah.miller@company.com',
    eventType: '30 Minute Meeting',
    date: '2026-04-18',
    time: '10:00 AM',
    status: 'upcoming',
  },
  {
    id: '2',
    guestName: 'Michael Chen',
    guestEmail: 'michael.chen@startup.io',
    eventType: '60 Minute Meeting',
    date: '2026-04-19',
    time: '2:00 PM',
    status: 'upcoming',
  },
  {
    id: '3',
    guestName: 'Emily Davis',
    guestEmail: 'emily.davis@agency.co',
    eventType: '15 Minute Meeting',
    date: '2026-04-20',
    time: '11:30 AM',
    status: 'upcoming',
  },
  {
    id: '4',
    guestName: 'James Wilson',
    guestEmail: 'james.wilson@corp.net',
    eventType: '30 Minute Meeting',
    date: '2026-04-10',
    time: '3:00 PM',
    status: 'past',
  },
  {
    id: '5',
    guestName: 'Lisa Thompson',
    guestEmail: 'lisa.thompson@design.co',
    eventType: '60 Minute Meeting',
    date: '2026-04-08',
    time: '9:00 AM',
    status: 'past',
  },
]

export const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
]
