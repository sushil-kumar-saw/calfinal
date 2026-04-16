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
  const [bufferBeforeMinutes, setBufferBeforeMinutes] = React.useState('0')
  const [bufferAfterMinutes, setBufferAfterMinutes] = React.useState('0')
  const [questions, setQuestions] = React.useState<
    NonNullable<EventType['questions']>
  >([])

  React.useEffect(() => {
    if (eventType) {
      setTitle(eventType.title)
      setDescription(eventType.description)
      setDuration(eventType.duration.toString())
      setColor(eventType.color)
      setBufferBeforeMinutes(String(eventType.bufferBeforeMinutes ?? 0))
      setBufferAfterMinutes(String(eventType.bufferAfterMinutes ?? 0))
      setQuestions(eventType.questions ?? [])
    } else {
      setTitle('')
      setDescription('')
      setDuration('30')
      setColor('bg-blue-500')
      setBufferBeforeMinutes('0')
      setBufferAfterMinutes('0')
      setQuestions([])
    }
  }, [eventType, open])

  const addQuestion = () => {
    setQuestions((current) => [
      ...current,
      {
        id: `question_${Date.now()}_${current.length}`,
        label: '',
        type: 'short_text',
        required: false,
        options: [],
      },
    ])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: eventType?.id,
      title,
      description,
      duration: parseInt(duration),
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      color,
      bufferBeforeMinutes: parseInt(bufferBeforeMinutes || '0', 10),
      bufferAfterMinutes: parseInt(bufferAfterMinutes || '0', 10),
      questions: questions.map((question) => ({
        ...question,
        options:
          question.type === 'select'
            ? (question.options ?? []).filter((option) => option.label && option.value)
            : [],
      })),
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
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="buffer-before">Buffer before (minutes)</FieldLabel>
                <Input
                  id="buffer-before"
                  type="number"
                  min="0"
                  value={bufferBeforeMinutes}
                  onChange={(e) => setBufferBeforeMinutes(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="buffer-after">Buffer after (minutes)</FieldLabel>
                <Input
                  id="buffer-after"
                  type="number"
                  min="0"
                  value={bufferAfterMinutes}
                  onChange={(e) => setBufferAfterMinutes(e.target.value)}
                />
              </Field>
            </div>
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel>Custom booking questions</FieldLabel>
                <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                  Add question
                </Button>
              </div>
              <div className="space-y-3">
                {questions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Ask guests for extra details before the meeting.
                  </p>
                ) : (
                  questions.map((question, index) => (
                    <div key={question.id} className="space-y-3 rounded-lg border p-3">
                      <Input
                        value={question.label}
                        onChange={(e) =>
                          setQuestions((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, label: e.target.value } : item
                            )
                          )
                        }
                        placeholder="Question label"
                      />
                      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                        <Select
                          value={question.type}
                          onValueChange={(value) =>
                            setQuestions((current) =>
                              current.map((item, itemIndex) =>
                                itemIndex === index
                                  ? {
                                      ...item,
                                      type: value as 'short_text' | 'long_text' | 'select',
                                      options:
                                        value === 'select'
                                          ? item.options?.length
                                            ? item.options
                                            : [{ label: '', value: '' }]
                                          : [],
                                    }
                                  : item
                              )
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="short_text">Short text</SelectItem>
                            <SelectItem value="long_text">Long text</SelectItem>
                            <SelectItem value="select">Select</SelectItem>
                          </SelectContent>
                        </Select>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={question.required}
                            onChange={(e) =>
                              setQuestions((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index ? { ...item, required: e.target.checked } : item
                                )
                              )
                            }
                          />
                          Required
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setQuestions((current) => current.filter((_, itemIndex) => itemIndex !== index))
                          }
                        >
                          Remove
                        </Button>
                      </div>
                      {question.type === 'select' && (
                        <div className="space-y-2">
                          {(question.options ?? []).map((option, optionIndex) => (
                            <div key={`${question.id}-${optionIndex}`} className="grid gap-2 sm:grid-cols-2">
                              <Input
                                value={option.label}
                                onChange={(e) =>
                                  setQuestions((current) =>
                                    current.map((item, itemIndex) =>
                                      itemIndex === index
                                        ? {
                                            ...item,
                                            options: (item.options ?? []).map((existing, existingIndex) =>
                                              existingIndex === optionIndex
                                                ? { ...existing, label: e.target.value }
                                                : existing
                                            ),
                                          }
                                        : item
                                    )
                                  )
                                }
                                placeholder="Option label"
                              />
                              <Input
                                value={option.value}
                                onChange={(e) =>
                                  setQuestions((current) =>
                                    current.map((item, itemIndex) =>
                                      itemIndex === index
                                        ? {
                                            ...item,
                                            options: (item.options ?? []).map((existing, existingIndex) =>
                                              existingIndex === optionIndex
                                                ? { ...existing, value: e.target.value }
                                                : existing
                                            ),
                                          }
                                        : item
                                    )
                                  )
                                }
                                placeholder="Option value"
                              />
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setQuestions((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...item,
                                        options: [...(item.options ?? []), { label: '', value: '' }],
                                      }
                                    : item
                                )
                              )
                            }
                          >
                            Add option
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
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
