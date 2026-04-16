'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import type { EventType } from '@/lib/types'
import { cn } from '@/lib/utils'

interface EventTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventType?: EventType | null
  onSave: (eventType: Omit<EventType, 'id'> & { id?: string }) => void
}

const colorOptions = [
  { value: 'bg-blue-500', label: 'Blue' },
  { value: 'bg-emerald-500', label: 'Green' },
  { value: 'bg-amber-500', label: 'Amber' },
  { value: 'bg-rose-500', label: 'Rose' },
  { value: 'bg-violet-500', label: 'Violet' },
]

const durationOptions = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '60 minutes' },
  { value: '90', label: '90 minutes' },
]

export function EventTypeDialog({
  open,
  onOpenChange,
  eventType,
  onSave,
}: EventTypeDialogProps) {
  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [duration, setDuration] = React.useState('30')
  const [color, setColor] = React.useState('bg-blue-500')

  React.useEffect(() => {
    if (eventType) {
      setTitle(eventType.title)
      setDescription(eventType.description)
      setDuration(eventType.duration.toString())
      setColor(eventType.color)
    } else {
      setTitle('')
      setDescription('')
      setDuration('30')
      setColor('bg-blue-500')
    }
  }, [eventType, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: eventType?.id,
      title,
      description,
      duration: parseInt(duration),
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      color,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {eventType ? 'Edit Event Type' : 'Create Event Type'}
          </DialogTitle>
          <DialogDescription>
            {eventType
              ? 'Make changes to your event type.'
              : 'Add a new event type for your bookings.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-4 py-4">
            <Field>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="30 Minute Meeting"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A quick call to discuss..."
                rows={3}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="duration">Duration</FieldLabel>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Color</FieldLabel>
              <div className="flex gap-2">
                {colorOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setColor(option.value)}
                    className={cn(
                      'size-8 rounded-full transition-all',
                      option.value,
                      color === option.value
                        ? 'ring-2 ring-ring ring-offset-2'
                        : 'hover:scale-110'
                    )}
                    title={option.label}
                  />
                ))}
              </div>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{eventType ? 'Save Changes' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
