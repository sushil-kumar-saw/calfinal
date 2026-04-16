'use client'

import * as React from 'react'
import { Plus, X, Copy, Check } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DayAvailability, TimeSlot } from '@/lib/types'
import { timezones } from '@/lib/mock-data'
import { useSchedulingStore } from '@/lib/store'
import { toast } from 'sonner'

interface AvailabilityFormProps {
  availability?: DayAvailability[]
  setAvailabilityState?: React.Dispatch<React.SetStateAction<DayAvailability[]>>
  timezone?: string
  setTimezoneState?: (timezone: string) => void
  onSave?: () => Promise<void>
}

export function AvailabilityForm(props: AvailabilityFormProps) {
  const store = useSchedulingStore()
  const availability = props.availability ?? store.availability
  const timezone = props.timezone ?? store.timezone
  const setTimezoneValue = props.setTimezoneState ?? store.setTimezone
  const [copiedDay, setCopiedDay] = React.useState<string | null>(null)

  const updateAvailabilityState = (updater: (current: DayAvailability[]) => DayAvailability[]) => {
    if (props.setAvailabilityState) {
      props.setAvailabilityState((current) => updater(current))
      return
    }
    const next = updater(store.availability)
    store.setAvailability(next)
  }

  const toggleDay = (day: string, currentEnabled: boolean) => {
    updateAvailabilityState((current) =>
      current.map((item) =>
        item.day === day
          ? currentEnabled
            ? { ...item, enabled: false, slots: [] }
            : { ...item, enabled: true, slots: [{ id: Date.now().toString(), start: '09:00', end: '17:00' }] }
          : item
      )
    )
  }

  const handleAddSlot = (day: string) => {
    const dayData = availability.find((a) => a.day === day)
    const slots = dayData?.slots ?? []
    const lastSlot = slots[slots.length - 1]
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      start: lastSlot ? lastSlot.end : '09:00',
      end: '17:00',
    }
    updateAvailabilityState((current) =>
      current.map((item) =>
        item.day === day ? { ...item, slots: [...item.slots, newSlot] } : item
      )
    )
  }

  const handleRemoveSlot = (day: string, slotId: string) => {
    const dayData = availability.find((a) => a.day === day)
    if (dayData && dayData.slots.length <= 1) {
      updateAvailabilityState((current) =>
        current.map((item) =>
          item.day === day ? { ...item, enabled: false, slots: [] } : item
        )
      )
    } else {
      updateAvailabilityState((current) =>
        current.map((item) =>
          item.day === day
            ? { ...item, slots: item.slots.filter((slot) => slot.id !== slotId) }
            : item
        )
      )
    }
  }

  const updateSlot = (
    day: string,
    slotId: string,
    field: 'start' | 'end',
    value: string
  ) => {
    const dayData = availability.find((a) => a.day === day)
    if (dayData) {
      updateAvailabilityState((current) =>
        current.map((item) =>
          item.day === day
            ? {
                ...item,
                slots: item.slots.map((slot) =>
                  slot.id === slotId ? { ...slot, [field]: value } : slot
                ),
              }
            : item
        )
      )
    }
  }

  const copyToAllDays = (sourceDay: string) => {
    const sourceDayData = availability.find((a) => a.day === sourceDay)
    if (!sourceDayData) return

    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    updateAvailabilityState((current) =>
      current.map((item) =>
        weekdays.includes(item.day) && item.day !== sourceDay
          ? {
              ...item,
              enabled: sourceDayData.enabled,
              slots: sourceDayData.slots.map((slot) => ({
                ...slot,
                id: `${item.day}-${Date.now()}-${Math.random()}`,
              })),
            }
          : item
      )
    )

    setCopiedDay(sourceDay)
    setTimeout(() => setCopiedDay(null), 2000)
    toast.success('Schedule copied to all weekdays')
  }

  const handleSave = async () => {
    if (props.onSave) {
      await props.onSave()
      return
    }
    try {
      const res = await fetch('/api/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability, timezone }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => null)
        toast.error(err?.error ?? 'Failed to save availability')
        return
      }

      toast.success('Availability saved successfully')
    } catch {
      toast.error('Failed to save availability')
    }
  }

  return (
    <div className="space-y-6">
      {/* Timezone Selector */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Timezone</CardTitle>
          <CardDescription>
            Set your timezone for all availability settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={timezone} onValueChange={setTimezoneValue}>
            <SelectTrigger className="w-full max-w-sm">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Weekly Availability */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Weekly Hours</CardTitle>
          <CardDescription>
            Set your available hours for each day of the week.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {availability.map((day) => (
            <div
              key={day.day}
              className="group flex flex-col gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-start"
            >
              <div className="flex min-w-36 items-center justify-between gap-3 sm:justify-start">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={day.enabled}
                    onCheckedChange={() => toggleDay(day.day, day.enabled)}
                    id={`day-${day.day}`}
                  />
                  <Label
                    htmlFor={`day-${day.day}`}
                    className="font-medium text-foreground"
                  >
                    {day.day}
                  </Label>
                </div>
                {day.enabled && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 px-2 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 sm:ml-2"
                    onClick={() => copyToAllDays(day.day)}
                  >
                    {copiedDay === day.day ? (
                      <>
                        <Check className="size-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        Copy to weekdays
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="flex-1">
                {day.enabled ? (
                  <div className="space-y-3">
                    {day.slots.map((slot) => (
                      <div key={slot.id} className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={slot.start}
                          onChange={(e) =>
                            updateSlot(day.day, slot.id, 'start', e.target.value)
                          }
                          className="w-28 sm:w-32"
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                          type="time"
                          value={slot.end}
                          onChange={(e) =>
                            updateSlot(day.day, slot.id, 'end', e.target.value)
                          }
                          className="w-28 sm:w-32"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveSlot(day.day, slot.id)}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-muted-foreground hover:text-foreground"
                      onClick={() => handleAddSlot(day.day)}
                    >
                      <Plus className="size-4" />
                      Add time slot
                    </Button>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Unavailable</span>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          Save Changes
        </Button>
      </div>
    </div>
  )
}
