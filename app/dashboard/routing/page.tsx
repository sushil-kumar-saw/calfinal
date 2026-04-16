'use client'

import * as React from 'react'
import { Plus, GitBranch, Trash2, GripVertical, ArrowRight } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface RoutingRule {
  id: string
  name: string
  description: string
  conditions: {
    field: string
    operator: string
    value: string
  }[]
  action: {
    type: 'assign' | 'redirect'
    target: string
  }
  enabled: boolean
}

const initialRules: RoutingRule[] = [
  {
    id: '1',
    name: 'Enterprise Leads',
    description: 'Route enterprise inquiries to sales team',
    conditions: [
      { field: 'company_size', operator: 'greater_than', value: '500' },
    ],
    action: { type: 'assign', target: 'Sales Team' },
    enabled: true,
  },
  {
    id: '2',
    name: 'Technical Support',
    description: 'Route technical questions to engineering',
    conditions: [
      { field: 'inquiry_type', operator: 'equals', value: 'technical' },
    ],
    action: { type: 'assign', target: 'Engineering Team' },
    enabled: true,
  },
  {
    id: '3',
    name: 'Demo Requests',
    description: 'Redirect demo requests to product team',
    conditions: [
      { field: 'meeting_type', operator: 'equals', value: 'demo' },
    ],
    action: { type: 'redirect', target: 'Product Demo Page' },
    enabled: false,
  },
]

export default function RoutingPage() {
  const [rules, setRules] = React.useState<RoutingRule[]>(initialRules)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [newRule, setNewRule] = React.useState({
    name: '',
    description: '',
    conditionField: 'company_size',
    conditionOperator: 'equals',
    conditionValue: '',
    actionType: 'assign',
    actionTarget: '',
  })

  const handleToggleRule = (id: string) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ))
    toast.success('Rule updated')
  }

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id))
    toast.success('Rule deleted')
  }

  const handleCreateRule = () => {
    if (!newRule.name.trim() || !newRule.actionTarget.trim()) return

    const rule: RoutingRule = {
      id: Date.now().toString(),
      name: newRule.name,
      description: newRule.description,
      conditions: [
        {
          field: newRule.conditionField,
          operator: newRule.conditionOperator,
          value: newRule.conditionValue,
        },
      ],
      action: {
        type: newRule.actionType as 'assign' | 'redirect',
        target: newRule.actionTarget,
      },
      enabled: true,
    }

    setRules([...rules, rule])
    setNewRule({
      name: '',
      description: '',
      conditionField: 'company_size',
      conditionOperator: 'equals',
      conditionValue: '',
      actionType: 'assign',
      actionTarget: '',
    })
    setDialogOpen(false)
    toast.success('Routing rule created')
  }

  const getOperatorLabel = (operator: string) => {
    const operators: Record<string, string> = {
      equals: 'equals',
      not_equals: 'does not equal',
      contains: 'contains',
      greater_than: 'is greater than',
      less_than: 'is less than',
    }
    return operators[operator] || operator
  }

  const getFieldLabel = (field: string) => {
    const fields: Record<string, string> = {
      company_size: 'Company Size',
      inquiry_type: 'Inquiry Type',
      meeting_type: 'Meeting Type',
      location: 'Location',
      industry: 'Industry',
    }
    return fields[field] || field
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Routing</h1>
          <p className="mt-1 text-muted-foreground">
            Set up rules to automatically route bookings to the right people.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              New Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create routing rule</DialogTitle>
              <DialogDescription>
                Define conditions and actions for automatic booking routing.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rule-name">Rule name</Label>
                <Input
                  id="rule-name"
                  placeholder="e.g., Enterprise Leads"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rule-description">Description</Label>
                <Input
                  id="rule-description"
                  placeholder="Optional description"
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Condition</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Select
                    value={newRule.conditionField}
                    onValueChange={(value) => setNewRule({ ...newRule, conditionField: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="company_size">Company Size</SelectItem>
                      <SelectItem value="inquiry_type">Inquiry Type</SelectItem>
                      <SelectItem value="meeting_type">Meeting Type</SelectItem>
                      <SelectItem value="location">Location</SelectItem>
                      <SelectItem value="industry">Industry</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={newRule.conditionOperator}
                    onValueChange={(value) => setNewRule({ ...newRule, conditionOperator: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">equals</SelectItem>
                      <SelectItem value="not_equals">does not equal</SelectItem>
                      <SelectItem value="contains">contains</SelectItem>
                      <SelectItem value="greater_than">greater than</SelectItem>
                      <SelectItem value="less_than">less than</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Value"
                    value={newRule.conditionValue}
                    onChange={(e) => setNewRule({ ...newRule, conditionValue: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Action</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={newRule.actionType}
                    onValueChange={(value) => setNewRule({ ...newRule, actionType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assign">Assign to</SelectItem>
                      <SelectItem value="redirect">Redirect to</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Target"
                    value={newRule.actionTarget}
                    onChange={(e) => setNewRule({ ...newRule, actionTarget: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRule}>Create Rule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rules List */}
      {rules.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <GitBranch className="size-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-foreground">No routing rules</h3>
          <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
            Create routing rules to automatically direct bookings to the right team members.
          </p>
          <Button onClick={() => setDialogOpen(true)} className="mt-6 gap-2">
            <Plus className="size-4" />
            Create Rule
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <Card key={rule.id} className={`border-border transition-opacity ${!rule.enabled ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="cursor-grab text-muted-foreground">
                    <GripVertical className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground">{rule.name}</h3>
                      <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                        {rule.enabled ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>
                    {rule.description && (
                      <p className="text-sm text-muted-foreground mt-0.5">{rule.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-sm">
                      <span className="text-muted-foreground">If</span>
                      {rule.conditions.map((condition, index) => (
                        <span key={index} className="flex items-center gap-1">
                          <Badge variant="outline" className="font-normal">
                            {getFieldLabel(condition.field)}
                          </Badge>
                          <span className="text-muted-foreground">{getOperatorLabel(condition.operator)}</span>
                          <Badge variant="outline" className="font-normal">
                            {condition.value}
                          </Badge>
                        </span>
                      ))}
                      <ArrowRight className="size-4 text-muted-foreground" />
                      <span className="text-muted-foreground capitalize">{rule.action.type}</span>
                      <Badge variant="secondary">{rule.action.target}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={() => handleToggleRule(rule.id)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteRule(rule.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="border-border bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">How routing works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Rules are evaluated in order from top to bottom.</p>
          <p>2. The first matching rule determines where the booking is routed.</p>
          <p>3. If no rules match, the booking uses default assignment.</p>
          <p>4. Drag rules to reorder their priority.</p>
        </CardContent>
      </Card>
    </div>
  )
}
