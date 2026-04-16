'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CalendarDays,
  Clock,
  Calendar,
  Menu,
  LogOut,
  Settings,
  Users,
  LayoutGrid,
  GitBranch,
  Zap,
  BarChart3,
  ExternalLink,
  Copy,
  Gift,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { mockUser } from '@/lib/mock-data'
import { toast } from 'sonner'

const mainNavItems = [
  { href: '/dashboard/event-types', label: 'Event Types', icon: CalendarDays },
  { href: '/dashboard/bookings', label: 'Bookings', icon: Calendar },
  { href: '/dashboard/availability', label: 'Availability', icon: Clock },
]

const advancedNavItems = [
  { href: '/dashboard/teams', label: 'Teams', icon: Users },
  { href: '/dashboard/apps', label: 'Apps', icon: LayoutGrid },
  { href: '/dashboard/routing', label: 'Routing', icon: GitBranch },
  { href: '/dashboard/workflows', label: 'Workflows', icon: Zap },
  { href: '/dashboard/insights', label: 'Insights', icon: BarChart3 },
]

export function MobileSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  const copyPublicLink = () => {
    const link = `${window.location.origin}/${mockUser.name.toLowerCase().replace(' ', '')}`
    navigator.clipboard.writeText(link)
    toast.success('Public link copied to clipboard')
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="size-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
        {/* User Profile Header */}
        <div className="flex h-14 items-center border-b border-sidebar-border px-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-auto justify-start gap-2.5 px-2 py-1.5 hover:bg-sidebar-accent/50"
              >
                <Avatar className="size-7">
                  <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
                  <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
                    {mockUser.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-sidebar-foreground">
                  {mockUser.name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem>
                <Settings className="mr-2 size-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 size-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          {/* Main Section */}
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/')

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                  )}
                >
                  <item.icon className="size-[18px]" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Divider */}
          <div className="my-4 h-px bg-sidebar-border" />

          {/* Advanced Section */}
          <div className="space-y-1">
            {advancedNavItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/')

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                  )}
                >
                  <item.icon className="size-[18px]" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-sidebar-border p-3 space-y-1">
          <Link
            href={`/${mockUser.name.toLowerCase().replace(' ', '')}`}
            target="_blank"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50"
          >
            <ExternalLink className="size-[18px]" />
            <span>View public page</span>
          </Link>
          <button
            onClick={copyPublicLink}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50"
          >
            <Copy className="size-[18px]" />
            <span>Copy public page link</span>
          </button>
          <Link
            href="/dashboard/referrals"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50"
          >
            <Gift className="size-[18px]" />
            <span>Refer and earn</span>
          </Link>
          <Link
            href="/dashboard/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50"
          >
            <Settings className="size-[18px]" />
            <span>Settings</span>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  )
}
