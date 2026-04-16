'use client'

import * as React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import type { Booking } from '@/lib/types'
import type { GeneratedSlot } from '@/lib/slots'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: Booking | null
  onRescheduled: () => Promise<void> | void
}

export function RescheduleDialog({ open, onOpenChange, booking, onRescheduled }: Props) {
  const [date, setDate] = React.useState('')
  const [slots, setSlots] = React.useState<GeneratedSlot[]>([])
  const [selectedStartTime, setSelectedStartTime] = React.useState<string | null>(null)
  const [loadingSlots, setLoadingSlots] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (!open || !booking) return
    setDate(booking.date)
    setSelectedStartTime(null)
  }, [open, booking])

  React.useEffect(() => {
    let cancelled = false

    async function loadSlots() {
      if (!open || !booking) return
      if (!date) return
      if (!booking.eventSlug) {
        setSlots([])
        return
      }
      setLoadingSlots(true)
      try {
        const res = await fetch('/api/slots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventSlug: booking.eventSlug,
            date,
            excludeBookingId: booking.id,
          }),
        })
        const data = (await res.json().catch(() => null)) as { slots?: GeneratedSlot[]; error?: any } | null
        if (!res.ok) {
          if (!cancelled) toast.error(data?.error ?? 'Failed to load available times')
          return
        }
        if (!cancelled) setSlots(data?.slots ?? [])
      } catch {
        if (!cancelled) setSlots([])
      } finally {
        if (!cancelled) setLoadingSlots(false)
      }
    }

    void loadSlots()
    return () => {
      cancelled = true
    }
  }, [open, booking, date])

  const canSubmit = Boolean(booking && date && selectedStartTime && !saving)

  const handleSubmit = async () => {
    if (!booking || !selectedStartTime) return
    setSaving(true)
    try {
      const res = await fetch(`/api/bookings/${booking.id}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, startTime: selectedStartTime }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(data?.error ?? 'Failed to reschedule booking')
        return
      }
      toast.success('Booking rescheduled successfully')
      await onRescheduled()
      onOpenChange(false)
    } catch {
      toast.error('Failed to reschedule booking')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Reschedule booking</DialogTitle>
          <DialogDescription>
            Pick a new date and time. Buffer time and conflicts are enforced automatically.
          </DialogDescription>
        </DialogHeader>

        {!booking ? (
          <div className="text-sm text-muted-foreground">No booking selected.</div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 sm:items-end">
              <div className="space-y-1.5">
                <div className="text-sm font-medium">Date</div>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="text-sm text-muted-foreground">
                {booking.guestName} • {booking.eventType}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Available times</div>
              {loadingSlots ? (
                <div className="text-sm text-muted-foreground">Loading…</div>
              ) : slots.length === 0 ? (
                <div className="text-sm text-muted-foreground">No available slots for this date.</div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {slots.map((slot) => (
                    <button
                      key={`${slot.startTime}-${slot.endTime}`}
                      type="button"
                      onClick={() => setSelectedStartTime(slot.startTime)}
                      className={cn(
                        'rounded-lg border border-border px-3 py-2 text-sm font-medium hover:border-primary hover:bg-primary/5',
                        selectedStartTime === slot.startTime && 'border-primary bg-primary text-primary-foreground hover:bg-primary'
                      )}
                    >
                      {slot.displayTime}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!canSubmit}>
                {saving ? 'Rescheduling…' : 'Confirm'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

