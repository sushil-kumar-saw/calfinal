'use client'

import * as React from 'react'
import { AvailabilityForm } from '@/components/dashboard/availability-form'
import { useSchedulingStore } from '@/lib/store'
import type { AvailabilitySchedule, DateOverride, DayAvailability } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const

function rangesToSlots(ranges: Array<{ startTime: string; endTime: string }>) {
  return ranges.map((r, idx) => ({
    id: `${r.startTime}-${r.endTime}-${idx}`,
    start: r.startTime,
    end: r.endTime,
  }))
}

export default function AvailabilityPage() {
  const { setAvailability, setTimezone, timezone } = useSchedulingStore()
  const [overrides, setOverrides] = React.useState<DateOverride[]>([])
  const [schedules, setSchedules] = React.useState<AvailabilitySchedule[]>([])
  const [selectedScheduleId, setSelectedScheduleId] = React.useState<string>('default')

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [availabilityRes, overridesRes] = await Promise.all([
          fetch('/api/availability'),
          fetch('/api/date-overrides'),
        ])
        if (!availabilityRes.ok) return
        const data = (await availabilityRes.json()) as {
          availability: Array<{ dayOfWeek: number; enabled: boolean; ranges: Array<{ startTime: string; endTime: string }> }>
          timezone?: string
          schedules?: Array<{
            id: string
            name: string
            isActive: boolean
            availability: Array<{ dayOfWeek: number; enabled: boolean; ranges: Array<{ startTime: string; endTime: string }> }>
          }>
          activeScheduleName?: string
        }
        const mappedSchedules: AvailabilitySchedule[] =
          (data.schedules ?? []).map((schedule) => ({
            id: schedule.id,
            name: schedule.name,
            isActive: schedule.isActive,
            availability: DAY_NAMES.map((day, i) => {
              const dayData = schedule.availability.find((d) => d.dayOfWeek === i)
              if (!dayData || !dayData.enabled) {
                return { day, enabled: false, slots: [] }
              }
              return {
                day,
                enabled: true,
                slots: rangesToSlots(dayData.ranges ?? []),
              }
            }),
          }))
        const activeSchedule =
          mappedSchedules.find((schedule) => schedule.isActive) ??
          mappedSchedules[0] ?? {
            id: 'default',
            name: 'Default Schedule',
            isActive: true,
            availability: DAY_NAMES.map((day) => ({ day, enabled: false, slots: [] })),
          }

        if (!cancelled) {
          setSchedules(mappedSchedules.length ? mappedSchedules : [activeSchedule])
          setSelectedScheduleId(activeSchedule.id)
          setAvailability(activeSchedule.availability)
          if (data.timezone) setTimezone(data.timezone)
        }
        if (!cancelled && overridesRes.ok) {
          const overrideData = (await overridesRes.json()) as { overrides: DateOverride[] }
          setOverrides(overrideData.overrides ?? [])
        }
      } catch {
        // Keep mock fallback.
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [setAvailability, setTimezone])

  const selectedSchedule =
    schedules.find((schedule) => schedule.id === selectedScheduleId) ?? schedules[0] ?? null

  const updateSelectedScheduleAvailability = React.useCallback(
    (updater: React.SetStateAction<DayAvailability[]>) => {
      setSchedules((current) =>
        current.map((schedule) => {
          if (schedule.id !== selectedScheduleId) return schedule
          const nextAvailability =
            typeof updater === 'function'
              ? (updater as (prev: DayAvailability[]) => DayAvailability[])(schedule.availability)
              : updater
          return { ...schedule, availability: nextAvailability }
        })
      )
    },
    [selectedScheduleId]
  )

  React.useEffect(() => {
    if (selectedSchedule) {
      setAvailability(selectedSchedule.availability)
    }
  }, [selectedSchedule, setAvailability])

  const addSchedule = () => {
    const id = `schedule-${Date.now()}`
    const created: AvailabilitySchedule = {
      id,
      name: `Schedule ${schedules.length + 1}`,
      isActive: schedules.length === 0,
      availability: DAY_NAMES.map((day) => ({ day, enabled: false, slots: [] })),
    }
    setSchedules((current) => [...current.map((schedule) => ({ ...schedule, isActive: false })), created])
    setSelectedScheduleId(id)
  }

  const removeSelectedSchedule = () => {
    if (schedules.length <= 1) {
      toast.error('Keep at least one availability schedule')
      return
    }
    const next = schedules.filter((schedule) => schedule.id !== selectedScheduleId)
    if (!next.some((schedule) => schedule.isActive)) {
      next[0] = { ...next[0], isActive: true }
    }
    setSchedules(next)
    setSelectedScheduleId(next[0].id)
  }

  const saveSchedules = async () => {
    try {
      const activeScheduleId =
        schedules.find((schedule) => schedule.isActive)?.id ?? selectedScheduleId
      const payload = {
        timezone,
        activeScheduleName:
          schedules.find((schedule) => schedule.id === activeScheduleId)?.name ?? 'Default Schedule',
        schedules: schedules.map((schedule) => ({
          id: schedule.id,
          name: schedule.name,
          isActive: schedule.id === activeScheduleId,
          availability: schedule.availability,
        })),
      }
      const res = await fetch('/api/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        toast.error(err?.error ?? 'Failed to save schedules')
        return
      }
      toast.success('Availability schedules saved successfully')
    } catch {
      toast.error('Failed to save schedules')
    }
  }

  const addOverride = () => {
    setOverrides((current) => [
      ...current,
      {
        id: `override_${Date.now()}_${current.length}`,
        date: '',
        blocked: true,
        slots: [],
      },
    ])
  }

  const saveOverrides = async () => {
    try {
      const payload = overrides
        .filter((override) => override.date)
        .map((override) => ({
          id: override.id,
          date: override.date,
          blocked: override.blocked,
          slots: override.blocked ? [] : override.slots.map((slot) => ({ start: slot.start, end: slot.end })),
        }))
      const res = await fetch('/api/date-overrides', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overrides: payload }),
      })
      if (!res.ok) {
        toast.error('Failed to save date overrides')
        return
      }
      const data = (await res.json()) as { overrides: DateOverride[] }
      setOverrides(data.overrides ?? [])
      toast.success('Date overrides saved')
    } catch {
      toast.error('Failed to save date overrides')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Availability</h1>
        <p className="mt-1 text-muted-foreground">
          Configure when you&apos;re available for bookings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Availability Schedules</CardTitle>
          <CardDescription>
            Create multiple named weekly schedules and choose which one is active.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select value={selectedScheduleId} onValueChange={setSelectedScheduleId}>
            <SelectTrigger className="w-full sm:max-w-sm">
              <SelectValue placeholder="Select schedule" />
            </SelectTrigger>
            <SelectContent>
              {schedules.map((schedule) => (
                <SelectItem key={schedule.id} value={schedule.id}>
                  {schedule.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={selectedSchedule?.name ?? ''}
            onChange={(e) =>
              setSchedules((current) =>
                current.map((schedule) =>
                  schedule.id === selectedScheduleId
                    ? { ...schedule, name: e.target.value || 'Untitled Schedule' }
                    : schedule
                )
              )
            }
            className="w-full sm:max-w-sm"
            placeholder="Schedule name"
          />
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={selectedSchedule?.isActive ?? false}
              onCheckedChange={() =>
                setSchedules((current) =>
                  current.map((schedule) => ({
                    ...schedule,
                    isActive: schedule.id === selectedScheduleId,
                  }))
                )
              }
            />
            Active schedule
          </label>
          <div className="flex gap-2">
            <Button variant="outline" onClick={addSchedule}>
              Add schedule
            </Button>
            <Button variant="ghost" onClick={removeSelectedSchedule}>
              Remove
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedSchedule ? (
        <AvailabilityForm
          availability={selectedSchedule.availability}
          setAvailabilityState={updateSelectedScheduleAvailability}
          timezone={timezone}
          setTimezoneState={setTimezone}
          onSave={saveSchedules}
        />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Date Overrides</CardTitle>
          <CardDescription>
            Block specific dates or replace weekly hours with custom times.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {overrides.length === 0 ? (
            <p className="text-sm text-muted-foreground">No date overrides configured yet.</p>
          ) : (
            overrides.map((override, index) => (
              <div key={override.id} className="space-y-3 rounded-lg border p-4">
                <div className="grid gap-3 sm:grid-cols-[180px_auto_auto] sm:items-center">
                  <Input
                    type="date"
                    value={override.date}
                    onChange={(e) =>
                      setOverrides((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, date: e.target.value } : item
                        )
                      )
                    }
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={override.blocked}
                      onCheckedChange={(checked) =>
                        setOverrides((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  blocked: checked,
                                  slots: checked ? [] : item.slots.length ? item.slots : [{ id: `${item.id}-slot`, start: '09:00', end: '17:00' }],
                                }
                              : item
                          )
                        )
                      }
                    />
                    Block this date
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setOverrides((current) => current.filter((_, itemIndex) => itemIndex !== index))
                    }
                  >
                    Remove
                  </Button>
                </div>

                {!override.blocked && (
                  <div className="space-y-2">
                    {(override.slots.length ? override.slots : [{ id: `${override.id}-slot`, start: '09:00', end: '17:00' }]).map((slot, slotIndex) => (
                      <div key={slot.id} className="grid gap-2 sm:grid-cols-[140px_140px_auto]">
                        <Input
                          type="time"
                          value={slot.start}
                          onChange={(e) =>
                            setOverrides((current) =>
                              current.map((item, itemIndex) =>
                                itemIndex === index
                                  ? {
                                      ...item,
                                      slots: (item.slots.length ? item.slots : [slot]).map((existing, existingIndex) =>
                                        existingIndex === slotIndex ? { ...existing, start: e.target.value } : existing
                                      ),
                                    }
                                  : item
                              )
                            )
                          }
                        />
                        <Input
                          type="time"
                          value={slot.end}
                          onChange={(e) =>
                            setOverrides((current) =>
                              current.map((item, itemIndex) =>
                                itemIndex === index
                                  ? {
                                      ...item,
                                      slots: (item.slots.length ? item.slots : [slot]).map((existing, existingIndex) =>
                                        existingIndex === slotIndex ? { ...existing, end: e.target.value } : existing
                                      ),
                                    }
                                  : item
                              )
                            )
                          }
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setOverrides((current) =>
                              current.map((item, itemIndex) =>
                                itemIndex === index
                                  ? {
                                      ...item,
                                      slots: [
                                        ...(item.slots.length ? item.slots : [slot]),
                                        { id: `${item.id}-${Date.now()}`, start: '09:00', end: '17:00' },
                                      ],
                                    }
                                  : item
                              )
                            )
                          }
                        >
                          Add slot
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
          <div className="flex justify-between">
            <Button variant="outline" onClick={addOverride}>
              Add override
            </Button>
            <Button onClick={saveOverrides}>Save overrides</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
