'use client'

import * as React from 'react'
import { Plus, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EventTypeCard } from '@/components/dashboard/event-type-card'
import { EventTypeDialog } from '@/components/dashboard/event-type-dialog'
import { useSchedulingStore } from '@/lib/store'
import type { EventType } from '@/lib/types'
import { toast } from 'sonner'

export default function EventTypesPage() {
  const { eventTypes, addEventType, updateEventType, deleteEventType } = useSchedulingStore()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingEventType, setEditingEventType] = React.useState<EventType | null>(null)

  const handleEdit = (eventType: EventType) => {
    setEditingEventType(eventType)
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteEventType(id)
    toast.success('Event type deleted')
  }

  const handleSave = (eventType: Omit<EventType, 'id'> & { id?: string }) => {
    if (eventType.id) {
      updateEventType(eventType.id, eventType)
      toast.success('Event type updated')
    } else {
      const newEventType: EventType = {
        ...eventType,
        id: Date.now().toString(),
      }
      addEventType(newEventType)
      toast.success('Event type created')
    }
    setEditingEventType(null)
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
