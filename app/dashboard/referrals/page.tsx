'use client'

import * as React from 'react'
import { Gift, Copy, Users, DollarSign, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function ReferralsPage() {
  const referralLink = 'https://schedulr.app/r/alexj2024'
  const referralCode = 'ALEXJ2024'

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    toast.success('Referral link copied to clipboard')
  }

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode)
    toast.success('Referral code copied to clipboard')
  }

  const stats = [
    { label: 'Total Referrals', value: '12', icon: Users },
    { label: 'Pending', value: '3', icon: Gift },
    { label: 'Earnings', value: '$120', icon: DollarSign },
  ]

  const referrals = [
    { name: 'Sarah M.', status: 'completed', reward: '$10', date: 'Apr 10, 2026' },
    { name: 'John D.', status: 'completed', reward: '$10', date: 'Apr 5, 2026' },
    { name: 'Emily R.', status: 'pending', reward: '$10', date: 'Apr 14, 2026' },
    { name: 'Michael C.', status: 'completed', reward: '$10', date: 'Mar 28, 2026' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Refer and Earn</h1>
        <p className="mt-1 text-muted-foreground">
          Invite friends and earn rewards when they sign up.
        </p>
      </div>

      {/* Referral Banner */}
      <Card className="border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center sm:flex-row sm:text-left gap-6">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Gift className="size-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground">Earn $10 for every friend</h2>
              <p className="mt-1 text-muted-foreground">
                Share your unique referral link and earn $10 when your friend signs up for a paid plan.
                They&apos;ll also get 20% off their first month!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                  <stat.icon className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Referral Link */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
          <CardDescription>Share this link with friends to earn rewards.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input value={referralLink} readOnly className="font-mono text-sm" />
            <Button onClick={copyLink} className="gap-2 shrink-0">
              <Copy className="size-4" />
              Copy
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Or share your code:</span>
            <div className="flex items-center gap-2">
              <code className="rounded-md bg-muted px-3 py-1 font-mono text-sm text-foreground">
                {referralCode}
              </code>
              <Button variant="ghost" size="icon" className="size-8" onClick={copyCode}>
                <Copy className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral History */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
          <CardDescription>Track your referrals and rewards.</CardDescription>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <Users className="size-6 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm font-medium text-foreground">No referrals yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Share your link to start earning rewards
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map((referral, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-border bg-background p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-muted">
                      <span className="text-sm font-medium text-foreground">
                        {referral.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{referral.name}</p>
                      <p className="text-xs text-muted-foreground">{referral.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">{referral.reward}</span>
                    {referral.status === 'completed' ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-500">
                        <CheckCircle2 className="size-3" />
                        Completed
                      </span>
                    ) : (
                      <span className="text-xs text-amber-500">Pending</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>How it Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Share your link',
                description: 'Send your unique referral link to friends and colleagues.',
              },
              {
                step: '2',
                title: 'They sign up',
                description: 'Your friend creates an account and subscribes to a paid plan.',
              },
              {
                step: '3',
                title: 'You both earn',
                description: 'You get $10 credit and they get 20% off their first month.',
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                  {item.step}
                </div>
                <h3 className="mt-3 font-medium text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
