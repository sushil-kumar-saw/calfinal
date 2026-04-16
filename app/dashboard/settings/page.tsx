'use client'

import * as React from 'react'
import { User, Bell, Shield, Globe, Palette, CreditCard, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { mockUser, timezones } from '@/lib/mock-data'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [profile, setProfile] = React.useState({
    name: mockUser.name,
    email: mockUser.email,
    username: 'alexjohnson',
    bio: 'Product designer and scheduling enthusiast.',
  })

  const [notifications, setNotifications] = React.useState({
    emailBookings: true,
    emailReminders: true,
    emailCancellations: true,
    browserNotifications: false,
  })

  const [preferences, setPreferences] = React.useState({
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    weekStart: 'sunday',
  })

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully')
  }

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved')
  }

  const handleSavePreferences = () => {
    toast.success('Preferences saved')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted/50 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-background">
            <User className="size-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-background">
            <Bell className="size-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2 data-[state=active]:bg-background">
            <Globe className="size-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 data-[state=active]:bg-background">
            <Shield className="size-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2 data-[state=active]:bg-background">
            <CreditCard className="size-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details and public profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="size-20">
                  <AvatarImage src={mockUser.avatar} />
                  <AvatarFallback className="bg-muted text-lg">
                    {mockUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    Change Avatar
                  </Button>
                  <p className="mt-1 text-xs text-muted-foreground">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profile.username}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="A short bio about yourself"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Choose what emails you want to receive.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">New bookings</p>
                  <p className="text-xs text-muted-foreground">Get notified when someone books a meeting</p>
                </div>
                <Switch
                  checked={notifications.emailBookings}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailBookings: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Meeting reminders</p>
                  <p className="text-xs text-muted-foreground">Receive reminders before your meetings</p>
                </div>
                <Switch
                  checked={notifications.emailReminders}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailReminders: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Cancellations</p>
                  <p className="text-xs text-muted-foreground">Get notified when a meeting is cancelled</p>
                </div>
                <Switch
                  checked={notifications.emailCancellations}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailCancellations: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Browser Notifications</CardTitle>
              <CardDescription>Get notifications in your browser.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Push notifications</p>
                  <p className="text-xs text-muted-foreground">Receive push notifications for important updates</p>
                </div>
                <Switch
                  checked={notifications.browserNotifications}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, browserNotifications: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveNotifications}>Save Preferences</Button>
          </div>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Regional Settings</CardTitle>
              <CardDescription>Configure your timezone and date preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select
                    value={preferences.timezone}
                    onValueChange={(value) => setPreferences({ ...preferences, timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date format</Label>
                  <Select
                    value={preferences.dateFormat}
                    onValueChange={(value) => setPreferences({ ...preferences, dateFormat: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Time format</Label>
                  <Select
                    value={preferences.timeFormat}
                    onValueChange={(value) => setPreferences({ ...preferences, timeFormat: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                      <SelectItem value="24h">24-hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Week starts on</Label>
                  <Select
                    value={preferences.weekStart}
                    onValueChange={(value) => setPreferences({ ...preferences, weekStart: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunday">Sunday</SelectItem>
                      <SelectItem value="monday">Monday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSavePreferences}>Save Preferences</Button>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <Button>Update Password</Button>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Enable 2FA</p>
                  <p className="text-xs text-muted-foreground">Use an authenticator app for additional security</p>
                </div>
                <Button variant="outline">Setup 2FA</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions for your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Delete Account</p>
                  <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="size-4" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Manage your subscription and billing.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
                <div>
                  <p className="text-lg font-semibold text-foreground">Pro Plan</p>
                  <p className="text-sm text-muted-foreground">$15/month, billed monthly</p>
                </div>
                <Button variant="outline">Manage Plan</Button>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Next billing date</span>
                  <span className="text-foreground">May 16, 2026</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Payment method</span>
                  <span className="text-foreground">Visa ending in 4242</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>Download your past invoices.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { date: 'Apr 16, 2026', amount: '$15.00', status: 'Paid' },
                  { date: 'Mar 16, 2026', amount: '$15.00', status: 'Paid' },
                  { date: 'Feb 16, 2026', amount: '$15.00', status: 'Paid' },
                ].map((invoice, index) => (
                  <div key={index} className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-foreground">{invoice.date}</span>
                      <span className="text-sm font-medium text-foreground">{invoice.amount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-500">{invoice.status}</span>
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
