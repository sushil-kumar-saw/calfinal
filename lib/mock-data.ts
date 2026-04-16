import type { EventType, DayAvailability, Booking, User, DateOverride, AvailabilitySchedule } from './types'

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
    bufferBeforeMinutes: 0,
    bufferAfterMinutes: 0,
    questions: [],
  },
  {
    id: '2',
    title: '30 Minute Meeting',
    description: 'Standard meeting for discussions and consultations.',
    duration: 30,
    slug: '30min',
    color: 'bg-emerald-500',
    bufferBeforeMinutes: 10,
    bufferAfterMinutes: 10,
    questions: [
      {
        id: 'q-company',
        label: 'Company or organization',
        type: 'short_text',
        required: false,
      },
    ],
  },
  {
    id: '3',
    title: '60 Minute Meeting',
    description: 'Extended session for in-depth discussions and presentations.',
    duration: 60,
    slug: '60min',
    color: 'bg-amber-500',
    bufferBeforeMinutes: 15,
    bufferAfterMinutes: 15,
    questions: [
      {
        id: 'q-agenda',
        label: 'What would you like to cover?',
        type: 'long_text',
        required: true,
      },
      {
        id: 'q-priority',
        label: 'Priority level',
        type: 'select',
        required: true,
        options: [
          { label: 'Low', value: 'low' },
          { label: 'Medium', value: 'medium' },
          { label: 'High', value: 'high' },
        ],
      },
    ],
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

export const mockAvailabilitySchedules: AvailabilitySchedule[] = [
  {
    id: 'default',
    name: 'Default Schedule',
    isActive: true,
    availability: mockAvailability,
  },
  {
    id: 'summer-hours',
    name: 'Summer Hours',
    isActive: false,
    availability: [
      { day: 'Monday', enabled: true, slots: [{ id: 'summer-1', start: '10:00', end: '16:00' }] },
      { day: 'Tuesday', enabled: true, slots: [{ id: 'summer-2', start: '10:00', end: '16:00' }] },
      { day: 'Wednesday', enabled: true, slots: [{ id: 'summer-3', start: '10:00', end: '16:00' }] },
      { day: 'Thursday', enabled: true, slots: [{ id: 'summer-4', start: '10:00', end: '16:00' }] },
      { day: 'Friday', enabled: true, slots: [{ id: 'summer-5', start: '10:00', end: '15:00' }] },
      { day: 'Saturday', enabled: false, slots: [] },
      { day: 'Sunday', enabled: false, slots: [] },
    ],
  },
]

export const mockBookings: Booking[] = [
  {
    id: '1',
    guestName: 'Sarah Miller',
    guestEmail: 'sarah.miller@company.com',
    eventType: '30 Minute Meeting',
    eventTypeId: '2',
    eventSlug: '30min',
    date: '2026-04-18',
    time: '10:00 AM',
    startTime: '10:00',
    endTime: '10:30',
    status: 'upcoming',
    notes: 'Would like to discuss onboarding.',
    answers: [
      {
        questionId: 'q-company',
        questionLabel: 'Company or organization',
        value: 'Acme Corp',
      },
    ],
  },
  {
    id: '2',
    guestName: 'Michael Chen',
    guestEmail: 'michael.chen@startup.io',
    eventType: '60 Minute Meeting',
    eventTypeId: '3',
    eventSlug: '60min',
    date: '2026-04-19',
    time: '2:00 PM',
    startTime: '14:00',
    endTime: '15:00',
    status: 'upcoming',
  },
  {
    id: '3',
    guestName: 'Emily Davis',
    guestEmail: 'emily.davis@agency.co',
    eventType: '15 Minute Meeting',
    eventTypeId: '1',
    eventSlug: '15min',
    date: '2026-04-20',
    time: '11:30 AM',
    startTime: '11:30',
    endTime: '11:45',
    status: 'upcoming',
  },
  {
    id: '4',
    guestName: 'James Wilson',
    guestEmail: 'james.wilson@corp.net',
    eventType: '30 Minute Meeting',
    eventTypeId: '2',
    eventSlug: '30min',
    date: '2026-04-10',
    time: '3:00 PM',
    startTime: '15:00',
    endTime: '15:30',
    status: 'past',
  },
  {
    id: '5',
    guestName: 'Lisa Thompson',
    guestEmail: 'lisa.thompson@design.co',
    eventType: '60 Minute Meeting',
    eventTypeId: '3',
    eventSlug: '60min',
    date: '2026-04-08',
    time: '9:00 AM',
    startTime: '09:00',
    endTime: '10:00',
    status: 'past',
  },
]

export const mockDateOverrides: DateOverride[] = [
  {
    id: 'override-1',
    date: '2026-04-22',
    blocked: true,
    slots: [],
  },
  {
    id: 'override-2',
    date: '2026-04-23',
    blocked: false,
    slots: [{ id: 'override-slot-1', start: '13:00', end: '16:00' }],
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
