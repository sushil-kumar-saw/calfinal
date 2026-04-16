'use client'

import * as React from 'react'
import Link from 'next/link'
import { Search, LayoutGrid, Download, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface App {
  id: string
  name: string
  description: string
  category: 'calendar' | 'video' | 'payment' | 'automation' | 'crm'
  icon: string
  installed: boolean
  popular?: boolean
}

const apps: App[] = [
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync your availability and bookings with Google Calendar.',
    category: 'calendar',
    icon: '/placeholder.svg',
    installed: true,
    popular: true,
  },
  {
    id: 'outlook-calendar',
    name: 'Outlook Calendar',
    description: 'Connect with Microsoft Outlook Calendar for seamless scheduling.',
    category: 'calendar',
    icon: '/placeholder.svg',
    installed: false,
    popular: true,
  },
  {
    id: 'zoom',
    name: 'Zoom',
    description: 'Automatically create Zoom meetings for your bookings.',
    category: 'video',
    icon: '/placeholder.svg',
    installed: true,
    popular: true,
  },
  {
    id: 'google-meet',
    name: 'Google Meet',
    description: 'Create Google Meet links for your video calls.',
    category: 'video',
    icon: '/placeholder.svg',
    installed: false,
    popular: true,
  },
  {
    id: 'microsoft-teams',
    name: 'Microsoft Teams',
    description: 'Schedule meetings with Microsoft Teams integration.',
    category: 'video',
    icon: '/placeholder.svg',
    installed: false,
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Accept payments for your bookings via Stripe.',
    category: 'payment',
    icon: '/placeholder.svg',
    installed: true,
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Collect payments through PayPal.',
    category: 'payment',
    icon: '/placeholder.svg',
    installed: false,
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect to thousands of apps with Zapier automations.',
    category: 'automation',
    icon: '/placeholder.svg',
    installed: false,
    popular: true,
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Sync bookings and contacts with Salesforce CRM.',
    category: 'crm',
    icon: '/placeholder.svg',
    installed: false,
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Connect your bookings with HubSpot CRM.',
    category: 'crm',
    icon: '/placeholder.svg',
    installed: false,
  },
]

const categories = [
  { id: 'all', label: 'All Apps' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'video', label: 'Video' },
  { id: 'payment', label: 'Payment' },
  { id: 'automation', label: 'Automation' },
  { id: 'crm', label: 'CRM' },
]

export default function AppsPage() {
  const [installedApps, setInstalledApps] = React.useState<string[]>(
    apps.filter(app => app.installed).map(app => app.id)
  )
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState('all')

  const handleInstall = (appId: string) => {
    setInstalledApps([...installedApps, appId])
    toast.success('App installed successfully')
  }

  const handleUninstall = (appId: string) => {
    setInstalledApps(installedApps.filter(id => id !== appId))
    toast.success('App uninstalled')
  }

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const installedAppsList = apps.filter(app => installedApps.includes(app.id))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Apps</h1>
        <p className="mt-1 text-muted-foreground">
          Connect integrations to enhance your scheduling experience.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="store" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="store" className="gap-2 data-[state=active]:bg-background">
              <LayoutGrid className="size-4" />
              App Store
            </TabsTrigger>
            <TabsTrigger value="installed" className="gap-2 data-[state=active]:bg-background">
              <Download className="size-4" />
              Installed
              {installedAppsList.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {installedAppsList.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Store Tab */}
        <TabsContent value="store" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search apps..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Popular Apps */}
          {selectedCategory === 'all' && searchQuery === '' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Popular Apps</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {apps.filter(app => app.popular).map((app) => (
                  <Card key={app.id} className="border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                          <LayoutGrid className="size-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground truncate">{app.name}</h3>
                          <p className="text-xs text-muted-foreground capitalize">{app.category}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        {installedApps.includes(app.id) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => handleUninstall(app.id)}
                          >
                            Installed
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => handleInstall(app.id)}
                          >
                            Install
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Apps */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              {selectedCategory === 'all' ? 'All Apps' : categories.find(c => c.id === selectedCategory)?.label}
            </h2>
            {filteredApps.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-12">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                  <Search className="size-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-base font-medium text-foreground">No apps found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try adjusting your search or filter
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredApps.map((app) => (
                  <Card key={app.id} className="border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
                          <LayoutGrid className="size-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base">{app.name}</CardTitle>
                          <Badge variant="outline" className="mt-1 font-normal capitalize">
                            {app.category}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CardDescription>{app.description}</CardDescription>
                      <div className="flex gap-2">
                        {installedApps.includes(app.id) ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleUninstall(app.id)}
                            >
                              Uninstall
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-1">
                              Settings
                              <ExternalLink className="size-3" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleInstall(app.id)}
                          >
                            Install
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Installed Tab */}
        <TabsContent value="installed" className="space-y-6">
          {installedAppsList.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16">
              <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                <Download className="size-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-foreground">No apps installed</h3>
              <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
                Browse the app store to find integrations that enhance your scheduling.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {installedAppsList.map((app) => (
                <Card key={app.id} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
                          <LayoutGrid className="size-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{app.name}</h3>
                          <p className="text-sm text-muted-foreground">{app.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">
                          {app.category}
                        </Badge>
                        <Button variant="outline" size="sm">
                          Settings
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleUninstall(app.id)}
                        >
                          Uninstall
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
