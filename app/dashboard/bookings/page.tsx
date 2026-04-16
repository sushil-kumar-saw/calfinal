'use client'

import * as React from 'react'
import { Calendar } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookingCard } from '@/components/dashboard/booking-card'
import { BookingSkeleton } from '@/components/dashboard/booking-skeleton'
import { RescheduleDialog } from '@/components/dashboard/reschedule-dialog'
import { useSchedulingStore } from '@/lib/store'
import type { Booking } from '@/lib/types'
import { toast } from 'sonner'

export default function BookingsPage() {
  const { bookings, setBookings } = useSchedulingStore()
  const [loading, setLoading] = React.useState(true)
  const [rescheduleOpen, setRescheduleOpen] = React.useState(false)
  const [rescheduleBooking, setRescheduleBooking] = React.useState<Booking | null>(null)

  const mapBookings = React.useCallback((items: Array<any>): Booking[] => {
    const nowMs = Date.now()
    return items.map((b: any) => {
      const [hhStr, mmStr] = String(b.startTime).split(':')
      const hh = Number(hhStr)
      const mm = Number(mmStr)
      const displayHour = hh % 12 || 12
      const ampm = hh < 12 ? 'AM' : 'PM'
      const timeLabel = `${displayHour}:${mm.toString().padStart(2, '0')} ${ampm}`

      const slotMs = new Date(`${b.date}T${b.startTime}:00.000Z`).getTime()
      const status: Booking['status'] =
        b.status === 'cancelled' || b.status === 'rescheduled'
          ? 'cancelled'
          : slotMs < nowMs
            ? 'past'
            : 'upcoming'

      return {
        id: b.id,
        guestName: b.name,
        guestEmail: b.email,
        eventType: b.eventTypeTitle ?? '',
        eventTypeId: b.eventTypeId,
        eventSlug: b.eventSlug ?? undefined,
        date: b.date,
        time: timeLabel,
        startTime: b.startTime,
        endTime: b.endTime,
        notes: b.notes ?? '',
        answers: b.answers ?? [],
        rescheduledFromId: b.rescheduledFromId ?? null,
        rescheduledToId: b.rescheduledToId ?? null,
        status,
      }
    })
  }, [])

  const refreshBookings = React.useCallback(async () => {
    const refreshed = await fetch('/api/bookings')
    if (!refreshed.ok) return false
    const data = (await refreshed.json()) as { bookings: Array<any> }
    setBookings(mapBookings(data.bookings))
    return true
  }, [mapBookings, setBookings])

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const res = await fetch('/api/bookings')
        if (!res.ok) return
        const data = (await res.json()) as { bookings: Array<any> }
        if (!cancelled) setBookings(mapBookings(data.bookings))
      } catch {
        // Keep mock fallback
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [mapBookings, setBookings])

  const upcomingBookings = bookings.filter((b) => b.status === 'upcoming')
  const pastBookings = bookings.filter((b) => b.status === 'past')

  const handleCancel = (id: string) => {
    ;(async () => {
      try {
        const res = await fetch('/api/bookings', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        })

        if (!res.ok) {
          toast.error('Failed to cancel booking')
          return
        }

        toast.success('Booking cancelled successfully')

        await refreshBookings()
      } catch {
        toast.error('Failed to cancel booking')
      }
    })()
  }

  const handleReschedule = (booking: Booking) => {
    setRescheduleBooking(booking)
    setRescheduleOpen(true)
  }

  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <Calendar className="size-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-foreground">No bookings</h3>
      <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
        {message}
      </p>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Bookings</h1>
        <p className="mt-1 text-muted-foreground">
          View and manage all your scheduled meetings.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="upcoming" className="gap-2 data-[state=active]:bg-background">
            Upcoming
            {upcomingBookings.length > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {upcomingBookings.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="past" className="data-[state=active]:bg-background">
            Past
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-3">
          {loading ? (
            <>
              <BookingSkeleton />
              <BookingSkeleton />
              <BookingSkeleton />
            </>
          ) : upcomingBookings.length === 0 ? (
            <EmptyState message="You don't have any upcoming bookings. Share your booking link to start receiving appointments." />
          ) : (
            upcomingBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancel}
                onReschedule={handleReschedule}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-3">
          {loading ? (
            <>
              <BookingSkeleton />
              <BookingSkeleton />
            </>
          ) : pastBookings.length === 0 ? (
            <EmptyState message="You don't have any past bookings yet." />
          ) : (
            pastBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </TabsContent>
      </Tabs>

      <RescheduleDialog
        open={rescheduleOpen}
        onOpenChange={(next) => {
          setRescheduleOpen(next)
          if (!next) setRescheduleBooking(null)
        }}
        booking={rescheduleBooking}
        onRescheduled={async () => {
          await refreshBookings()
        }}
      />
    </div>
  )
}
