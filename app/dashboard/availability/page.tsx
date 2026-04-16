'use client'

import { AvailabilityForm } from '@/components/dashboard/availability-form'

export default function AvailabilityPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Availability</h1>
        <p className="mt-1 text-muted-foreground">
          Configure when you&apos;re available for bookings.
        </p>
      </div>

      {/* Availability Form */}
      <AvailabilityForm />
    </div>
  )
}
