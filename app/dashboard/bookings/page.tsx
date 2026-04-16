'use client'

import * as React from 'react'
import { Calendar } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookingCard } from '@/components/dashboard/booking-card'
import { BookingSkeleton } from '@/components/dashboard/booking-skeleton'
import { useSchedulingStore } from '@/lib/store'
import { toast } from 'sonner'

export default function BookingsPage() {
  const { bookings, cancelBooking } = useSchedulingStore()
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const upcomingBookings = bookings.filter((b) => b.status === 'upcoming')
  const pastBookings = bookings.filter((b) => b.status === 'past')

  const handleCancel = (id: string) => {
    cancelBooking(id)
    toast.success('Booking cancelled successfully')
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
    </div>
  )
}
