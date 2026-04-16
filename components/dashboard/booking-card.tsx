'use client'

import { Calendar, Clock, Mail, Video, MoreVertical, X, MessageSquare } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Booking } from '@/lib/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

interface BookingCardProps {
  booking: Booking
  onCancel?: (id: string) => void
  onReschedule?: (booking: Booking) => void
}

export function BookingCard({ booking, onCancel, onReschedule }: BookingCardProps) {
  const isPast = booking.status === 'past'
  const isCancelled = booking.status === 'cancelled'

  const formattedDate = new Date(booking.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  return (
    <Card 
      className={cn(
        'group border-border transition-all duration-200 hover:shadow-md',
        isCancelled && 'opacity-60'
      )}
    >
      <CardContent className="p-0">
        <div className="flex">
          {/* Left date indicator */}
          <div className="flex w-20 shrink-0 flex-col items-center justify-center border-r border-border bg-muted/30 p-4">
            <span className="text-xs font-medium uppercase text-muted-foreground">
              {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short' })}
            </span>
            <span className="text-2xl font-bold text-foreground">
              {new Date(booking.date).getDate()}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(booking.date).toLocaleDateString('en-US', { month: 'short' })}
            </span>
          </div>

          {/* Main content */}
          <div className="flex flex-1 items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                <span className="text-sm font-semibold text-foreground">
                  {booking.guestName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground">{booking.guestName}</h3>
                  {isCancelled && (
                    <Badge variant="destructive" className="text-xs">
                      Cancelled
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{booking.eventType}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {booking.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <Video className="size-3" />
                    Cal Video
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {!isPast && !isCancelled && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden gap-1.5 sm:inline-flex"
                    onClick={() => onReschedule?.(booking)}
                  >
                    <MessageSquare className="size-4" />
                    Reschedule
                  </Button>
                  <AlertDialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Video className="mr-2 size-4" />
                          Join meeting
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onReschedule?.(booking)}>
                          <MessageSquare className="mr-2 size-4" />
                          Reschedule
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 size-4" />
                          Email guest
                        </DropdownMenuItem>
                        {onCancel && (
                          <>
                            <DropdownMenuSeparator />
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-destructive focus:text-destructive">
                                <X className="mr-2 size-4" />
                                Cancel booking
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to cancel this booking with {booking.guestName}? 
                          They will be notified via email.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onCancel?.(booking.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Cancel Booking
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
              {isPast && (
                <Badge variant="secondary" className="text-xs">
                  Completed
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
