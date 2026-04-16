'use client'

import * as React from 'react'
import { BarChart3, TrendingUp, TrendingDown, Calendar, Clock, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface StatCard {
  title: string
  value: string
  change: number
  changeLabel: string
  icon: React.ElementType
}

const stats: StatCard[] = [
  {
    title: 'Total Bookings',
    value: '248',
    change: 12.5,
    changeLabel: 'from last month',
    icon: Calendar,
  },
  {
    title: 'Hours Booked',
    value: '164h',
    change: 8.2,
    changeLabel: 'from last month',
    icon: Clock,
  },
  {
    title: 'Unique Guests',
    value: '89',
    change: -3.1,
    changeLabel: 'from last month',
    icon: Users,
  },
  {
    title: 'Conversion Rate',
    value: '68%',
    change: 5.4,
    changeLabel: 'from last month',
    icon: TrendingUp,
  },
]

const popularTimes = [
  { time: '9:00 AM', bookings: 45 },
  { time: '10:00 AM', bookings: 62 },
  { time: '11:00 AM', bookings: 38 },
  { time: '12:00 PM', bookings: 15 },
  { time: '1:00 PM', bookings: 22 },
  { time: '2:00 PM', bookings: 58 },
  { time: '3:00 PM', bookings: 71 },
  { time: '4:00 PM', bookings: 49 },
  { time: '5:00 PM', bookings: 25 },
]

const topEventTypes = [
  { name: '30 Minute Meeting', bookings: 124, percentage: 50 },
  { name: '15 Minute Meeting', bookings: 78, percentage: 31.5 },
  { name: '60 Minute Meeting', bookings: 46, percentage: 18.5 },
]

const weeklyData = [
  { day: 'Mon', bookings: 18 },
  { day: 'Tue', bookings: 24 },
  { day: 'Wed', bookings: 32 },
  { day: 'Thu', bookings: 28 },
  { day: 'Fri', bookings: 22 },
  { day: 'Sat', bookings: 8 },
  { day: 'Sun', bookings: 4 },
]

export default function InsightsPage() {
  const [timeRange, setTimeRange] = React.useState('30d')

  const maxBookings = Math.max(...popularTimes.map(t => t.bookings))
  const maxWeekly = Math.max(...weeklyData.map(d => d.bookings))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Insights</h1>
          <p className="mt-1 text-muted-foreground">
            Analytics and trends for your scheduling activity.
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="12m">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border">
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
              <div className="mt-1 flex items-center gap-1 text-xs">
                {stat.change >= 0 ? (
                  <>
                    <ArrowUpRight className="size-3 text-emerald-500" />
                    <span className="text-emerald-500">+{stat.change}%</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="size-3 text-red-500" />
                    <span className="text-red-500">{stat.change}%</span>
                  </>
                )}
                <span className="text-muted-foreground">{stat.changeLabel}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-background">
            Overview
          </TabsTrigger>
          <TabsTrigger value="popular" className="data-[state=active]:bg-background">
            Popular Times
          </TabsTrigger>
          <TabsTrigger value="events" className="data-[state=active]:bg-background">
            Event Types
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Weekly Bookings Chart */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Weekly Bookings</CardTitle>
              <CardDescription>Number of bookings per day of the week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-2 h-48">
                {weeklyData.map((data) => (
                  <div key={data.day} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-md bg-primary transition-all hover:opacity-80"
                      style={{ height: `${(data.bookings / maxWeekly) * 100}%` }}
                    />
                    <span className="text-xs text-muted-foreground">{data.day}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Your latest booking activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: 'New booking', name: 'Sarah Miller', time: '2 hours ago' },
                  { action: 'Booking cancelled', name: 'John Doe', time: '5 hours ago' },
                  { action: 'New booking', name: 'Emily Davis', time: 'Yesterday' },
                  { action: 'Booking rescheduled', name: 'Michael Chen', time: 'Yesterday' },
                  { action: 'New booking', name: 'Lisa Thompson', time: '2 days ago' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                        <Calendar className="size-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.name}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popular" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Popular Booking Times</CardTitle>
              <CardDescription>When guests prefer to book meetings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {popularTimes.map((slot) => (
                  <div key={slot.time} className="flex items-center gap-4">
                    <span className="w-20 text-sm text-muted-foreground">{slot.time}</span>
                    <div className="flex-1 h-8 bg-muted rounded-md overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-md transition-all"
                        style={{ width: `${(slot.bookings / maxBookings) * 100}%` }}
                      />
                    </div>
                    <span className="w-12 text-sm font-medium text-foreground text-right">
                      {slot.bookings}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Booking Patterns</CardTitle>
              <CardDescription>Insights about when guests book</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Peak booking time</p>
                  <p className="text-xs text-muted-foreground">Most popular time slot</p>
                </div>
                <span className="text-2xl font-bold text-foreground">3:00 PM</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Busiest day</p>
                  <p className="text-xs text-muted-foreground">Day with most bookings</p>
                </div>
                <span className="text-2xl font-bold text-foreground">Wednesday</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Quietest day</p>
                  <p className="text-xs text-muted-foreground">Day with fewest bookings</p>
                </div>
                <span className="text-2xl font-bold text-foreground">Sunday</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Top Event Types</CardTitle>
              <CardDescription>Most booked event types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topEventTypes.map((eventType, index) => (
                  <div key={eventType.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-foreground">{eventType.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-foreground">{eventType.bookings}</span>
                        <span className="text-xs text-muted-foreground ml-1">({eventType.percentage}%)</span>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${eventType.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Average Duration</CardTitle>
                <CardDescription>Average meeting length</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">32</span>
                  <span className="text-lg text-muted-foreground">minutes</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Cancellation Rate</CardTitle>
                <CardDescription>Percentage of cancelled bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">4.2</span>
                  <span className="text-lg text-muted-foreground">%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
