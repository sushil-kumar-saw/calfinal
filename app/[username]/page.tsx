'use client'

import * as React from 'react'
import Link from 'next/link'
import { CalendarDays, Clock, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSchedulingStore } from '@/lib/store'
import { mockUser } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const colorPalette = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500']

export default function UserBookingPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = React.use(params)
  const { eventTypes, setEventTypes } = useSchedulingStore()

  React.useEffect(() => {
    let cancelled = false

    async function loadEventTypes() {
      try {
        const res = await fetch('/api/event-types', { method: 'GET' })
        if (!res.ok) return
        const data = (await res.json()) as { eventTypes: any[] }

        const mapped = data.eventTypes.map((et, i) => ({
          id: et.id,
          title: et.title,
          description: et.description,
          duration: et.duration,
          slug: et.slug,
          userId: et.userId,
          color: colorPalette[i % colorPalette.length],
        }))

        if (!cancelled) setEventTypes(mapped)
      } catch {
        // Keep mock UI state if backend isn't reachable/configured.
      }
    }

    loadEventTypes()
    return () => {
      cancelled = true
    }
  }, [setEventTypes])

  const colorMap: Record<string, string> = {
    'bg-blue-500': 'bg-blue-500',
    'bg-emerald-500': 'bg-emerald-500',
    'bg-amber-500': 'bg-amber-500',
    'bg-rose-500': 'bg-rose-500',
    'bg-purple-500': 'bg-purple-500',
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center">
          <Avatar className="mx-auto size-24 border-4 border-background shadow-lg">
            <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {mockUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <h1 className="mt-4 text-2xl font-semibold text-foreground">
            {mockUser.name}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Select an event type to schedule a meeting
          </p>
        </div>
      </div>

      {/* Event Types */}
      <div className="mx-auto max-w-3xl px-4 py-8">
        {eventTypes.length === 0 ? (
          <Card className="border-border">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarDays className="size-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium text-foreground">
                No event types available
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                This user hasn&apos;t set up any event types yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {eventTypes.map((eventType) => (
              <Link
                key={eventType.id}
                href={`/${username}/${eventType.slug}`}
                className="group block"
              >
                <Card className="border-border transition-all duration-200 hover:border-foreground/20 hover:shadow-md hover:-translate-y-0.5">
                  <CardHeader className="flex flex-row items-start gap-4 pb-3">
                    <div
                      className={cn(
                        'size-3 rounded-full mt-1.5 shrink-0',
                        colorMap[eventType.color] || 'bg-primary'
                      )}
                    />
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold group-hover:text-foreground">
                        {eventType.title}
                      </CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">
                        {eventType.description}
                      </CardDescription>
                    </div>
                    <ExternalLink className="size-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="size-4" />
                      <span>{eventType.duration} minutes</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-card py-6 mt-auto">
        <p className="text-center text-sm text-muted-foreground">
          Powered by{' '}
          <Link href="/" className="font-medium text-foreground hover:underline">
            Schedulr
          </Link>
        </p>
      </div>
    </div>
  )
}
