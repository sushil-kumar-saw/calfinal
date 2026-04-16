'use client'

import * as React from 'react'
import { Plus, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EventTypeCard } from '@/components/dashboard/event-type-card'
import { EventTypeDialog } from '@/components/dashboard/event-type-dialog'
import { useSchedulingStore } from '@/lib/store'
import type { EventType } from '@/lib/types'
import { toast } from 'sonner'

const colorPalette = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500']

function colorForSlug(slug: string) {
  const sum = slug.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return colorPalette[sum % colorPalette.length]
}

export default function EventTypesPage() {
  const { eventTypes, setEventTypes } = useSchedulingStore()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingEventType, setEditingEventType] = React.useState<EventType | null>(null)

  const loadEventTypes = React.useCallback(async () => {
    try {
      const res = await fetch('/api/event-types')
      if (!res.ok) return
      const data = (await res.json()) as { eventTypes: Array<any> }
      const mapped: EventType[] = data.eventTypes.map((et, i) => ({
        id: et.id,
        title: et.title,
        description: et.description,
        duration: et.duration,
        slug: et.slug,
        color: et.color ?? colorForSlug(et.slug ?? `idx-${i}`),
        bufferBeforeMinutes: et.bufferBeforeMinutes ?? 0,
        bufferAfterMinutes: et.bufferAfterMinutes ?? 0,
        questions: et.questions ?? [],
      }))
      setEventTypes(mapped)
    } catch {
      // Keep mock fallback
    }
  }, [setEventTypes])

  React.useEffect(() => {
    void loadEventTypes()
  }, [loadEventTypes])

  const handleEdit = (eventType: EventType) => {
    setEditingEventType(eventType)
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    ;(async () => {
      try {
        const res = await fetch('/api/event-types', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        })

        if (!res.ok) {
          toast.error('Failed to delete event type')
          return
        }

        toast.success('Event type deleted')
        await loadEventTypes()
      } catch {
        toast.error('Failed to delete event type')
      } finally {
        setEditingEventType(null)
      }
    })()
  }

  const handleSave = (eventType: Omit<EventType, 'id'> & { id?: string }) => {
    ;(async () => {
      try {
        if (eventType.id) {
          const res = await fetch('/api/event-types', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: eventType.id,
              title: eventType.title,
              description: eventType.description,
              duration: eventType.duration,
              slug: eventType.slug,
              color: eventType.color,
              bufferBeforeMinutes: eventType.bufferBeforeMinutes ?? 0,
              bufferAfterMinutes: eventType.bufferAfterMinutes ?? 0,
              questions: eventType.questions ?? [],
            }),
          })

          if (!res.ok) {
            toast.error('Failed to update event type')
            return
          }

          toast.success('Event type updated')
        } else {
          const res = await fetch('/api/event-types', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: eventType.title,
              description: eventType.description,
              duration: eventType.duration,
              slug: eventType.slug,
              color: eventType.color,
              bufferBeforeMinutes: eventType.bufferBeforeMinutes ?? 0,
              bufferAfterMinutes: eventType.bufferAfterMinutes ?? 0,
              questions: eventType.questions ?? [],
            }),
          })

          if (!res.ok) {
            toast.error('Failed to create event type')
            return
          }

          toast.success('Event type created')
        }

        await loadEventTypes()
      } catch {
        toast.error('Failed to save event type')
      } finally {
        setEditingEventType(null)
      }
    })()
  }

  const handleOpenDialog = () => {
    setEditingEventType(null)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Event Types</h1>
          <p className="mt-1 text-muted-foreground">
            Create and manage your event types for bookings.
          </p>
        </div>
        <Button onClick={handleOpenDialog} className="gap-2">
          <Plus className="size-4" />
          New Event Type
        </Button>
      </div>

      {/* Event Types Grid */}
      {eventTypes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <CalendarDays className="size-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-foreground">
            No event types yet
          </h3>
          <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
            Create your first event type to start accepting bookings from your clients.
          </p>
          <Button onClick={handleOpenDialog} className="mt-6 gap-2">
            <Plus className="size-4" />
            Create Event Type
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {eventTypes.map((eventType) => (
            <EventTypeCard
              key={eventType.id}
              eventType={eventType}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Event Type Dialog */}
      <EventTypeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        eventType={editingEventType}
        onSave={handleSave}
      />
    </div>
  )
}
