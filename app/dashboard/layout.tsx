'use client'

import * as React from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { MobileSidebar } from '@/components/dashboard/mobile-sidebar'
import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/sonner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>
      
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background px-4 lg:hidden">
        <MobileSidebar />
        <span className="text-lg font-semibold">Schedulr</span>
      </header>
      
      {/* Main Content */}
      <main
        className={cn(
          'min-h-screen transition-all duration-300',
          'lg:pl-64',
          collapsed && 'lg:pl-16'
        )}
      >
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  )
}
