'use client'

import * as React from 'react'
import { Plus, Zap, Mail, MessageSquare, Clock, Trash2, MoreHorizontal, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface WorkflowStep {
  id: string
  type: 'email' | 'sms' | 'wait'
  config: {
    subject?: string
    body?: string
    message?: string
    duration?: number
    unit?: 'minutes' | 'hours' | 'days'
  }
}

interface Workflow {
  id: string
  name: string
  description: string
  trigger: 'before_event' | 'after_event' | 'on_booking' | 'on_cancellation'
  triggerOffset?: { value: number; unit: 'minutes' | 'hours' | 'days' }
  steps: WorkflowStep[]
  enabled: boolean
  executions: number
}

const initialWorkflows: Workflow[] = [
  {
    id: '1',
    name: 'Booking Confirmation',
    description: 'Send confirmation email when a meeting is booked',
    trigger: 'on_booking',
    steps: [
      {
        id: '1',
        type: 'email',
        config: {
          subject: 'Your meeting has been confirmed',
          body: 'Hi {guest_name}, your meeting with {host_name} has been confirmed for {date} at {time}.',
        },
      },
    ],
    enabled: true,
    executions: 156,
  },
  {
    id: '2',
    name: 'Meeting Reminder',
    description: 'Send reminder 24 hours before the meeting',
    trigger: 'before_event',
    triggerOffset: { value: 24, unit: 'hours' },
    steps: [
      {
        id: '1',
        type: 'email',
        config: {
          subject: 'Reminder: Meeting tomorrow',
          body: 'Hi {guest_name}, this is a reminder about your meeting with {host_name} tomorrow at {time}.',
        },
      },
    ],
    enabled: true,
    executions: 89,
  },
  {
    id: '3',
    name: 'Follow-up Email',
    description: 'Send follow-up 1 hour after the meeting',
    trigger: 'after_event',
    triggerOffset: { value: 1, unit: 'hours' },
    steps: [
      {
        id: '1',
        type: 'wait',
        config: { duration: 1, unit: 'hours' },
      },
      {
        id: '2',
        type: 'email',
        config: {
          subject: 'Thank you for meeting with us',
          body: 'Hi {guest_name}, thank you for meeting with {host_name}. We hope it was productive!',
        },
      },
    ],
    enabled: false,
    executions: 42,
  },
]

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = React.useState<Workflow[]>(initialWorkflows)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [newWorkflow, setNewWorkflow] = React.useState({
    name: '',
    description: '',
    trigger: 'on_booking',
    stepType: 'email',
    emailSubject: '',
    emailBody: '',
  })

  const handleToggleWorkflow = (id: string) => {
    setWorkflows(workflows.map(wf => 
      wf.id === id ? { ...wf, enabled: !wf.enabled } : wf
    ))
    const workflow = workflows.find(wf => wf.id === id)
    toast.success(workflow?.enabled ? 'Workflow paused' : 'Workflow activated')
  }

  const handleDeleteWorkflow = (id: string) => {
    setWorkflows(workflows.filter(wf => wf.id !== id))
    toast.success('Workflow deleted')
  }

  const handleCreateWorkflow = () => {
    if (!newWorkflow.name.trim()) return

    const workflow: Workflow = {
      id: Date.now().toString(),
      name: newWorkflow.name,
      description: newWorkflow.description,
      trigger: newWorkflow.trigger as Workflow['trigger'],
      steps: [
        {
          id: '1',
          type: newWorkflow.stepType as 'email',
          config: {
            subject: newWorkflow.emailSubject,
            body: newWorkflow.emailBody,
          },
        },
      ],
      enabled: true,
      executions: 0,
    }

    setWorkflows([...workflows, workflow])
    setNewWorkflow({
      name: '',
      description: '',
      trigger: 'on_booking',
      stepType: 'email',
      emailSubject: '',
      emailBody: '',
    })
    setDialogOpen(false)
    toast.success('Workflow created')
  }

  const getTriggerLabel = (trigger: string) => {
    const triggers: Record<string, string> = {
      before_event: 'Before event',
      after_event: 'After event',
      on_booking: 'On booking',
      on_cancellation: 'On cancellation',
    }
    return triggers[trigger] || trigger
  }

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="size-4" />
      case 'sms':
        return <MessageSquare className="size-4" />
      case 'wait':
        return <Clock className="size-4" />
      default:
        return <Zap className="size-4" />
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Workflows</h1>
          <p className="mt-1 text-muted-foreground">
            Automate emails, reminders, and follow-ups for your bookings.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              New Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create workflow</DialogTitle>
              <DialogDescription>
                Set up automated actions triggered by booking events.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="workflow-name">Workflow name</Label>
                <Input
                  id="workflow-name"
                  placeholder="e.g., Booking Confirmation"
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workflow-description">Description</Label>
                <Input
                  id="workflow-description"
                  placeholder="Optional description"
                  value={newWorkflow.description}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Trigger</Label>
                <Select
                  value={newWorkflow.trigger}
                  onValueChange={(value) => setNewWorkflow({ ...newWorkflow, trigger: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on_booking">When booking is created</SelectItem>
                    <SelectItem value="before_event">Before the event</SelectItem>
                    <SelectItem value="after_event">After the event</SelectItem>
                    <SelectItem value="on_cancellation">When booking is cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Action type</Label>
                <Select
                  value={newWorkflow.stepType}
                  onValueChange={(value) => setNewWorkflow({ ...newWorkflow, stepType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Send email</SelectItem>
                    <SelectItem value="sms">Send SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newWorkflow.stepType === 'email' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email-subject">Email subject</Label>
                    <Input
                      id="email-subject"
                      placeholder="Your meeting has been confirmed"
                      value={newWorkflow.emailSubject}
                      onChange={(e) => setNewWorkflow({ ...newWorkflow, emailSubject: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-body">Email body</Label>
                    <Textarea
                      id="email-body"
                      placeholder="Hi {guest_name}, your meeting with {host_name}..."
                      className="min-h-[100px]"
                      value={newWorkflow.emailBody}
                      onChange={(e) => setNewWorkflow({ ...newWorkflow, emailBody: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Available variables: {'{guest_name}'}, {'{host_name}'}, {'{date}'}, {'{time}'}
                    </p>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateWorkflow}>Create Workflow</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Workflows List */}
      {workflows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Zap className="size-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-foreground">No workflows yet</h3>
          <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
            Create automated workflows to send emails, reminders, and follow-ups.
          </p>
          <Button onClick={() => setDialogOpen(true)} className="mt-6 gap-2">
            <Plus className="size-4" />
            Create Workflow
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workflows.map((workflow) => (
            <Card key={workflow.id} className={`border-border transition-opacity ${!workflow.enabled ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`rounded-lg p-2 ${workflow.enabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                      <Zap className="size-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{workflow.name}</CardTitle>
                      <Badge variant="outline" className="mt-1 font-normal">
                        {getTriggerLabel(workflow.trigger)}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteWorkflow(workflow.id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {workflow.description && (
                  <CardDescription className="mt-2">{workflow.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Steps */}
                <div className="space-y-2">
                  {workflow.steps.map((step, index) => (
                    <div
                      key={step.id}
                      className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      <span className="flex size-5 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
                        {index + 1}
                      </span>
                      {getStepIcon(step.type)}
                      <span className="text-muted-foreground capitalize">{step.type}</span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {workflow.executions} executions
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => handleToggleWorkflow(workflow.id)}
                    >
                      {workflow.enabled ? (
                        <Pause className="size-4" />
                      ) : (
                        <Play className="size-4" />
                      )}
                    </Button>
                    <Switch
                      checked={workflow.enabled}
                      onCheckedChange={() => handleToggleWorkflow(workflow.id)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
