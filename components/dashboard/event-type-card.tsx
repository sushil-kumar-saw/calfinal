'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Clock, Copy, MoreVertical, Pencil, Trash2, Check, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { EventType } from '@/lib/types'
import { mockUser } from '@/lib/mock-data'
import { toast } from 'sonner'

interface EventTypeCardProps {
  eventType: EventType
  onEdit: (eventType: EventType) => void
  onDelete: (id: string) => void
}

export function EventTypeCard({ eventType, onEdit, onDelete }: EventTypeCardProps) {
  const [copied, setCopied] = useState(false)
  const [enabled, setEnabled] = useState(true)

  const username = mockUser.name.toLowerCase().replace(' ', '')

  const handleCopyLink = async () => {
    if (typeof window === 'undefined') return
    const bookingLink = `${window.location.origin}/${username}/${eventType.slug}`
    await navigator.clipboard.writeText(bookingLink)
    setCopied(true)
    toast.success('Booking link copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleToggle = () => {
    setEnabled(!enabled)
    toast.success(enabled ? 'Event type disabled' : 'Event type enabled')
  }

  const colorMap: Record<string, string> = {
    'bg-blue-500': 'border-l-blue-500',
    'bg-emerald-500': 'border-l-emerald-500',
    'bg-amber-500': 'border-l-amber-500',
    'bg-rose-500': 'border-l-rose-500',
    'bg-purple-500': 'border-l-purple-500',
  }

  return (
    <Card 
      className={cn(
        'group relative overflow-hidden border-l-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
        colorMap[eventType.color] || 'border-l-primary',
        !enabled && 'opacity-60'
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground truncate">{eventType.title}</h3>
              {!enabled && (
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  Disabled
                </span>
              )}
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {eventType.description}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Switch
              checked={enabled}
              onCheckedChange={handleToggle}
              className="data-[state=checked]:bg-primary"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(eventType)}>
                  <Pencil className="mr-2 size-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${username}/${eventType.slug}`} target="_blank">
                    <ExternalLink className="mr-2 size-4" />
                    Preview
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(eventType.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="size-4" />
              <span>{eventType.duration} min</span>
            </div>
            {(eventType.bufferBeforeMinutes || eventType.bufferAfterMinutes || eventType.questions?.length) ? (
              <div className="text-xs">
                Buffer {eventType.bufferBeforeMinutes ?? 0}/{eventType.bufferAfterMinutes ?? 0} min
                {' • '}
                {eventType.questions?.length ?? 0} question{(eventType.questions?.length ?? 0) === 1 ? '' : 's'}
              </div>
            ) : null}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={handleCopyLink}
          >
            {copied ? (
              <>
                <Check className="size-4 text-emerald-500" />
                <span className="text-emerald-500">Copied</span>
              </>
            ) : (
              <>
                <Copy className="size-4" />
                <span>Copy link</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
