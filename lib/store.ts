import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { EventType, DayAvailability, Booking } from './types'
import { mockEventTypes, mockAvailability, mockBookings } from './mock-data'

interface SchedulingStore {
  // Event Types
  eventTypes: EventType[]
  addEventType: (eventType: EventType) => void
  updateEventType: (id: string, updates: Partial<EventType>) => void
  deleteEventType: (id: string) => void
  setEventTypes: (eventTypes: EventType[]) => void
  
  // Availability
  availability: DayAvailability[]
  updateAvailability: (day: string, updates: Partial<DayAvailability>) => void
  addTimeSlot: (day: string, slot: { id: string; start: string; end: string }) => void
  removeTimeSlot: (day: string, slotId: string) => void
  setAvailability: (availability: DayAvailability[]) => void
  
  // Bookings
  bookings: Booking[]
  addBooking: (booking: Booking) => void
  cancelBooking: (id: string) => void
  setBookings: (bookings: Booking[]) => void
  
  // User preferences
  timezone: string
  setTimezone: (tz: string) => void
  
  // Sidebar state
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useSchedulingStore = create<SchedulingStore>()(
  persist(
    (set) => ({
      // Initial state
      eventTypes: mockEventTypes,
      availability: mockAvailability,
      bookings: mockBookings,
      timezone: 'America/New_York',
      sidebarCollapsed: false,
      
      // Event Type actions
      addEventType: (eventType) =>
        set((state) => ({
          eventTypes: [...state.eventTypes, eventType],
        })),
      
      updateEventType: (id, updates) =>
        set((state) => ({
          eventTypes: state.eventTypes.map((et) =>
            et.id === id ? { ...et, ...updates } : et
          ),
        })),
      
      deleteEventType: (id) =>
        set((state) => ({
          eventTypes: state.eventTypes.filter((et) => et.id !== id),
        })),

      setEventTypes: (eventTypes) => set({ eventTypes }),
      
      // Availability actions
      updateAvailability: (day, updates) =>
        set((state) => ({
          availability: state.availability.map((a) =>
            a.day === day ? { ...a, ...updates } : a
          ),
        })),
      
      addTimeSlot: (day, slot) =>
        set((state) => ({
          availability: state.availability.map((a) =>
            a.day === day ? { ...a, slots: [...a.slots, slot] } : a
          ),
        })),
      
      removeTimeSlot: (day, slotId) =>
        set((state) => ({
          availability: state.availability.map((a) =>
            a.day === day
              ? { ...a, slots: a.slots.filter((s) => s.id !== slotId) }
              : a
          ),
        })),

      setAvailability: (availability) => set({ availability }),
      
      // Booking actions
      addBooking: (booking) =>
        set((state) => ({
          bookings: [...state.bookings, booking],
        })),
      
      cancelBooking: (id) =>
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === id ? { ...b, status: 'cancelled' as const } : b
          ),
        })),

      setBookings: (bookings) => set({ bookings }),
      
      // Preferences
      setTimezone: (tz) => set({ timezone: tz }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: 'scheduling-store',
      partialize: (state) => ({
        eventTypes: state.eventTypes,
        availability: state.availability,
        bookings: state.bookings,
        timezone: state.timezone,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)

// Helper functions for booking logic
export function getAvailableSlots(
  date: Date,
  eventDuration: number,
  availability: DayAvailability[],
  bookings: Booking[]
): string[] {
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
  const dayAvailability = availability.find((a) => a.day === dayName)
  
  if (!dayAvailability || !dayAvailability.enabled) {
    return []
  }
  
  const dateStr = date.toISOString().split('T')[0]
  const dayBookings = bookings.filter(
    (b) => b.date === dateStr && b.status !== 'cancelled'
  )
  
  const slots: string[] = []
  
  for (const timeRange of dayAvailability.slots) {
    const [startHour, startMin] = timeRange.start.split(':').map(Number)
    const [endHour, endMin] = timeRange.end.split(':').map(Number)
    
    let currentMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    
    while (currentMinutes + eventDuration <= endMinutes) {
      const hour = Math.floor(currentMinutes / 60)
      const min = currentMinutes % 60
      const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
      
      // Format for display
      const displayHour = hour % 12 || 12
      const ampm = hour < 12 ? 'AM' : 'PM'
      const displayTime = `${displayHour}:${min.toString().padStart(2, '0')} ${ampm}`
      
      // Check if slot is already booked
      const isBooked = dayBookings.some((b) => b.time === displayTime)
      
      if (!isBooked) {
        slots.push(displayTime)
      }
      
      currentMinutes += 30 // 30-minute intervals
    }
  }
  
  return slots
}
