'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
  Globe,
  ArrowLeft,
  Check,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useSchedulingStore } from '@/lib/store'
import { mockUser, timezones } from '@/lib/mock-data'
import type { EventType } from '@/lib/types'
import type { GeneratedSlot } from '@/lib/slots'
import { toast } from 'sonner'

const colorPalette = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500']

type BookingStep = 'select-time' | 'details' | 'confirmed'

export default function EventBookingPage({
  params,
}: {
  params: Promise<{ username: string; eventSlug: string }>
}) {
  const { username, eventSlug } = React.use(params)
  const { eventTypes, availability, timezone, setTimezone } = useSchedulingStore()

  const [step, setStep] = React.useState<BookingStep>('select-time')
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null)
  const [selectedStartTime, setSelectedStartTime] = React.useState<string | null>(null)
  const [availableSlots, setAvailableSlots] = React.useState<GeneratedSlot[]>([])
  const [apiEventType, setApiEventType] = React.useState<EventType | null>(null)
  const [eventTypeHydrated, setEventTypeHydrated] = React.useState(false)
  const [availabilityHydrated, setAvailabilityHydrated] = React.useState(false)
  const [enabledDays, setEnabledDays] = React.useState<boolean[]>([false, false, false, false, false, false, false])
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [notes, setNotes] = React.useState('')
  const [answers, setAnswers] = React.useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false

    async function loadEventType() {
      try {
        const res = await fetch(`/api/event/${eventSlug}`)
        if (!res.ok) return

        const data = (await res.json()) as { eventType: any }
        if (cancelled) return

        const et = data.eventType
        if (!et) return

        const colorIndex =
          et.slug?.split?.('').reduce((acc: number, ch: string) => acc + ch.charCodeAt(0), 0) ??
          0

        setApiEventType({
          id: et.id,
          title: et.title,
          description: et.description,
          duration: et.duration,
          slug: et.slug,
          color: et.color ?? colorPalette[colorIndex % colorPalette.length],
          bufferBeforeMinutes: et.bufferBeforeMinutes ?? 0,
          bufferAfterMinutes: et.bufferAfterMinutes ?? 0,
          questions: et.questions ?? [],
        })
      } catch {
        // Keep mock fallback if backend isn't reachable.
      } finally {
        if (!cancelled) setEventTypeHydrated(true)
      }
    }

    async function loadAvailability() {
      try {
        const res = await fetch('/api/availability')
        if (!res.ok) return
        const data = (await res.json()) as {
          availability: Array<{ dayOfWeek: number; enabled: boolean }>
          timezone?: string
        }
        const nextEnabled = [false, false, false, false, false, false, false]
        for (const d of data.availability) {
          nextEnabled[d.dayOfWeek] = d.enabled
        }
        if (!cancelled) {
          setEnabledDays(nextEnabled)
          if (data.timezone) setTimezone(data.timezone)
          setAvailabilityHydrated(true)
        }
      } catch {
        // Keep mock fallback.
      }
    }

    loadEventType()
    loadAvailability()

    return () => {
      cancelled = true
    }
  }, [eventSlug])

  React.useEffect(() => {
    let cancelled = false

    async function loadSlots() {
      if (!selectedDate) {
        setAvailableSlots([])
        return
      }
      try {
        const dateStr = selectedDate.toISOString().split('T')[0]
        const res = await fetch('/api/slots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventSlug, date: dateStr }),
        })

        if (!res.ok) return
        const data = (await res.json()) as { slots: GeneratedSlot[] }
        if (!cancelled) setAvailableSlots(data.slots ?? [])
      } catch {
        // If slot generation fails, show empty state.
        if (!cancelled) setAvailableSlots([])
      }
    }

    loadSlots()

    return () => {
      cancelled = true
    }
  }, [selectedDate, eventSlug])

  const initialEventType = eventTypes.find((e) => e.slug === eventSlug) ?? null
  const eventType = apiEventType ?? initialEventType

  if (!eventType) {
    if (!eventTypeHydrated) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30">
          <Card className="max-w-md">
            <CardContent className="flex flex-col items-center py-12 text-center gap-2">
              <CalendarDays className="size-12 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">Loading event…</div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <CalendarDays className="size-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Event not found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This event type doesn&apos;t exist or has been removed.
            </p>
            <Button asChild className="mt-6">
              <Link href={`/${username}`}>Back to profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days: (Date | null)[] = []
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const days = getDaysInMonth(currentMonth)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isDateAvailable = (date: Date) => {
    if (date < today) return false
    if (availabilityHydrated) {
      // Backend computes dayOfWeek from the UTC date string we send to `/api/slots`.
      // Use UTC here to avoid timezone drift between server + client.
      const dayOfWeek = date.getUTCDay() // 0=Sun..6=Sat
      return enabledDays[dayOfWeek] ?? false
    }

    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
    const dayAvailability = availability.find((a) => a.day === dayName)
    return dayAvailability?.enabled ?? false
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime(null)
    setSelectedStartTime(null)
  }

  const handleTimeSelect = (slot: GeneratedSlot) => {
    setSelectedTime(slot.displayTime)
    setSelectedStartTime(slot.startTime)
  }

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      setStep('details')
    }
  }

  const handleBack = () => {
    if (step === 'details') {
      setStep('select-time')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !selectedStartTime || !name || !email) return

    setIsSubmitting(true)

    try {
      const dateStr = selectedDate.toISOString().split('T')[0]

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventSlug,
          name,
          email,
          date: dateStr,
          startTime: selectedStartTime,
          notes,
          answers: Object.entries(answers).map(([questionId, value]) => ({ questionId, value })),
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => null)
        toast.error(err?.error ?? 'Failed to schedule event')
        return
      }

      setStep('confirmed')
    } catch {
      toast.error('Failed to schedule event')
    } finally {
      setIsSubmitting(false)
    }
  }

  const colorMap: Record<string, string> = {
    'bg-blue-500': 'border-l-blue-500',
    'bg-emerald-500': 'border-l-emerald-500',
    'bg-amber-500': 'border-l-amber-500',
    'bg-rose-500': 'border-l-rose-500',
    'bg-purple-500': 'border-l-purple-500',
  }

  // Confirmed step
  if (step === 'confirmed') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Check className="size-8" />
            </div>
            <h3 className="mt-6 text-xl font-semibold">Booking Confirmed</h3>
            <p className="mt-2 text-muted-foreground">
              Your meeting has been scheduled successfully.
            </p>
            <div className="mt-6 rounded-xl border border-border bg-muted/50 p-4 text-left w-full">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Event:</span>
                  <span className="font-medium">{eventType.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">
                    {selectedDate?.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              A confirmation email has been sent to {email}
            </p>
            <Button asChild className="mt-6 w-full">
              <Link href={`/${username}`}>Schedule another meeting</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Back button */}
        <Link
          href={`/${username}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>

        <Card className={cn('border-l-4', colorMap[eventType.color] || 'border-l-primary')}>
          <div className="grid lg:grid-cols-[300px_1fr]">
            {/* Event Info Sidebar */}
            <div className="border-b border-border p-6 lg:border-b-0 lg:border-r">
              <Avatar className="size-12">
                <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
                <AvatarFallback className="bg-muted text-muted-foreground">
                  {mockUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <p className="mt-3 text-sm text-muted-foreground">{mockUser.name}</p>
              <h1 className="mt-1 text-xl font-semibold text-foreground">
                {eventType.title}
              </h1>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="size-4" />
                  <span>{eventType.duration} min</span>
                </div>
                {(eventType.bufferBeforeMinutes || eventType.bufferAfterMinutes) ? (
                  <div className="flex items-center gap-2">
                    <Clock className="size-4" />
                    <span>
                      Buffer {eventType.bufferBeforeMinutes ?? 0}/{eventType.bufferAfterMinutes ?? 0} min
                    </span>
                  </div>
                ) : null}
                <div className="flex items-center gap-2">
                  <Globe className="size-4" />
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger className="h-auto border-0 p-0 text-sm text-muted-foreground hover:text-foreground [&>svg]:hidden">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {eventType.description && (
                <p className="mt-4 text-sm text-muted-foreground">
                  {eventType.description}
                </p>
              )}

              {/* Selected date/time summary */}
              {selectedDate && selectedTime && step === 'details' && (
                <div className="mt-6 rounded-lg border border-border bg-muted/50 p-3">
                  <p className="text-sm font-medium">
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedTime}</p>
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="p-6">
              {step === 'select-time' && (
                <div className="grid gap-6 lg:grid-cols-[1fr_200px]">
                  {/* Calendar */}
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="font-semibold">
                        {currentMonth.toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </h2>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setCurrentMonth(
                              new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
                            )
                          }
                        >
                          <ChevronLeft className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setCurrentMonth(
                              new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
                            )
                          }
                        >
                          <ChevronRight className="size-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center text-sm">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div
                          key={day}
                          className="py-2 text-xs font-medium text-muted-foreground"
                        >
                          {day}
                        </div>
                      ))}
                      {days.map((date, i) => {
                        if (!date) {
                          return <div key={`empty-${i}`} />
                        }
                        const isAvailable = isDateAvailable(date)
                        const isSelected =
                          selectedDate?.toDateString() === date.toDateString()
                        const isToday = date.toDateString() === today.toDateString()

                        return (
                          <button
                            key={date.toISOString()}
                            disabled={!isAvailable}
                            onClick={() => handleDateSelect(date)}
                            className={cn(
                              'relative aspect-square rounded-lg text-sm font-medium transition-colors',
                              isAvailable
                                ? 'hover:bg-accent cursor-pointer'
                                : 'text-muted-foreground/50 cursor-not-allowed',
                              isSelected && 'bg-primary text-primary-foreground hover:bg-primary',
                              isToday && !isSelected && 'ring-1 ring-primary'
                            )}
                          >
                            {date.getDate()}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Time Slots */}
                  {selectedDate && (
                    <div>
                      <h3 className="mb-3 text-sm font-medium">
                        {selectedDate.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </h3>
                      <div className="max-h-[300px] space-y-2 overflow-y-auto">
                        {availableSlots.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No available slots
                          </p>
                        ) : (
                          availableSlots.map((slot) => (
                            <button
                              key={slot.startTime}
                              onClick={() => handleTimeSelect(slot)}
                              className={cn(
                                'w-full rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:border-primary hover:bg-primary/5',
                                selectedTime === slot.displayTime &&
                                  'border-primary bg-primary text-primary-foreground hover:bg-primary'
                              )}
                            >
                              {slot.displayTime}
                            </button>
                          ))
                        )}
                      </div>
                      {selectedTime && (
                        <Button onClick={handleContinue} className="mt-4 w-full">
                          Continue
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {step === 'details' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="mb-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="size-4" />
                    Back
                  </button>

                  <div>
                    <label className="text-sm font-medium">Your name *</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Email address *</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      required
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Additional notes{' '}
                      <span className="text-muted-foreground">(optional)</span>
                    </label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Please share anything that will help prepare for our meeting..."
                      className="mt-1.5 min-h-[100px]"
                    />
                  </div>

                  {(eventType.questions ?? []).map((question) => (
                    <div key={question.id}>
                      <label className="text-sm font-medium">
                        {question.label}
                        {question.required ? ' *' : ' '}
                        {!question.required && (
                          <span className="text-muted-foreground">(optional)</span>
                        )}
                      </label>
                      {question.type === 'long_text' ? (
                        <Textarea
                          value={answers[question.id] ?? ''}
                          onChange={(e) =>
                            setAnswers((current) => ({ ...current, [question.id]: e.target.value }))
                          }
                          required={question.required}
                          className="mt-1.5 min-h-[90px]"
                        />
                      ) : question.type === 'select' ? (
                        <Select
                          value={answers[question.id] ?? ''}
                          onValueChange={(value) =>
                            setAnswers((current) => ({ ...current, [question.id]: value }))
                          }
                        >
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            {(question.options ?? []).map((option) => (
                              <SelectItem key={`${question.id}-${option.value}`} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={answers[question.id] ?? ''}
                          onChange={(e) =>
                            setAnswers((current) => ({ ...current, [question.id]: e.target.value }))
                          }
                          required={question.required}
                          className="mt-1.5"
                        />
                      )}
                    </div>
                  ))}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || !name || !email}
                  >
                    {isSubmitting ? 'Scheduling...' : 'Schedule Event'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </Card>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Powered by{' '}
          <Link href="/" className="font-medium text-foreground hover:underline">
            Schedulr
          </Link>
        </p>
      </div>
    </div>
  )
}
