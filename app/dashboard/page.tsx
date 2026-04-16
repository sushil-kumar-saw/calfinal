'use client'

import Link from 'next/link'
import { CalendarDays, Clock, Users, TrendingUp, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSchedulingStore } from '@/lib/store'
import { mockUser } from '@/lib/mock-data'

export default function DashboardPage() {
  const { eventTypes, bookings } = useSchedulingStore()
  
  const upcomingBookings = bookings
    .filter((b) => b.status === 'upcoming')
    .slice(0, 5)

  const stats = [
    {
      title: 'Total Bookings',
      value: bookings.length,
      description: 'All time bookings',
      icon: CalendarDays,
    },
    {
      title: 'Upcoming',
      value: bookings.filter((b) => b.status === 'upcoming').length,
      description: 'Scheduled meetings',
      icon: Clock,
    },
    {
      title: 'Event Types',
      value: eventTypes.length,
      description: 'Active event types',
      icon: Users,
    },
    {
      title: 'This Month',
      value: '12',
      description: 'Meetings completed',
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Welcome back, {mockUser.name.split(' ')[0]}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s an overview of your scheduling activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card 
            key={stat.title} 
            className="group relative overflow-hidden border-border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="rounded-lg bg-muted p-2">
                <stat.icon className="size-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming Bookings */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Upcoming Bookings</CardTitle>
            <CardDescription>Your next scheduled meetings</CardDescription>
          </div>
          {upcomingBookings.length > 0 && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/bookings" className="gap-1">
                View all
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {upcomingBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <CalendarDays className="size-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No upcoming bookings</p>
              <p className="text-sm text-muted-foreground mt-1">
                Share your booking link to start getting meetings
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0 transition-colors hover:bg-muted/50 -mx-6 px-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                      <span className="text-sm font-medium text-foreground">
                        {booking.guestName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {booking.guestName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.eventType}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">
                      {new Date(booking.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">{booking.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          <CardDescription>Common tasks to get you started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <Link
              href="/dashboard/event-types"
              className="group flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center transition-all duration-200 hover:border-foreground/20 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="rounded-xl bg-muted p-3 transition-colors group-hover:bg-foreground/10">
                <CalendarDays className="size-6 text-foreground" />
              </div>
              <span className="mt-4 font-medium text-foreground">
                Create Event Type
              </span>
              <span className="mt-1 text-sm text-muted-foreground">
                Set up a new meeting type
              </span>
            </Link>
            <Link
              href="/dashboard/availability"
              className="group flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center transition-all duration-200 hover:border-foreground/20 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="rounded-xl bg-muted p-3 transition-colors group-hover:bg-foreground/10">
                <Clock className="size-6 text-foreground" />
              </div>
              <span className="mt-4 font-medium text-foreground">
                Set Availability
              </span>
              <span className="mt-1 text-sm text-muted-foreground">
                Configure your schedule
              </span>
            </Link>
            <Link
              href="/dashboard/bookings"
              className="group flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center transition-all duration-200 hover:border-foreground/20 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="rounded-xl bg-muted p-3 transition-colors group-hover:bg-foreground/10">
                <Users className="size-6 text-foreground" />
              </div>
              <span className="mt-4 font-medium text-foreground">
                View Bookings
              </span>
              <span className="mt-1 text-sm text-muted-foreground">
                Manage your meetings
              </span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
