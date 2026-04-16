'use client'

import * as React from 'react'
import { Plus, Users, Mail, MoreHorizontal, UserPlus, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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
import { toast } from 'sonner'

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'member'
  avatar?: string
}

interface Team {
  id: string
  name: string
  slug: string
  members: TeamMember[]
}

const initialTeams: Team[] = [
  {
    id: '1',
    name: 'Engineering',
    slug: 'engineering',
    members: [
      { id: '1', name: 'Alex Johnson', email: 'alex@example.com', role: 'owner' },
      { id: '2', name: 'Sarah Miller', email: 'sarah@example.com', role: 'admin' },
      { id: '3', name: 'Michael Chen', email: 'michael@example.com', role: 'member' },
    ],
  },
  {
    id: '2',
    name: 'Sales',
    slug: 'sales',
    members: [
      { id: '4', name: 'Emily Davis', email: 'emily@example.com', role: 'owner' },
      { id: '5', name: 'James Wilson', email: 'james@example.com', role: 'member' },
    ],
  },
]

export default function TeamsPage() {
  const [teams, setTeams] = React.useState<Team[]>(initialTeams)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false)
  const [selectedTeam, setSelectedTeam] = React.useState<Team | null>(null)
  const [newTeamName, setNewTeamName] = React.useState('')
  const [inviteEmail, setInviteEmail] = React.useState('')

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) return
    
    const newTeam: Team = {
      id: Date.now().toString(),
      name: newTeamName,
      slug: newTeamName.toLowerCase().replace(/\s+/g, '-'),
      members: [
        { id: '1', name: 'Alex Johnson', email: 'alex@example.com', role: 'owner' },
      ],
    }
    
    setTeams([...teams, newTeam])
    setNewTeamName('')
    setCreateDialogOpen(false)
    toast.success('Team created successfully')
  }

  const handleInviteMember = () => {
    if (!inviteEmail.trim() || !selectedTeam) return
    
    setTeams(teams.map(team => {
      if (team.id === selectedTeam.id) {
        return {
          ...team,
          members: [
            ...team.members,
            {
              id: Date.now().toString(),
              name: inviteEmail.split('@')[0],
              email: inviteEmail,
              role: 'member',
            },
          ],
        }
      }
      return team
    }))
    
    setInviteEmail('')
    setInviteDialogOpen(false)
    toast.success('Invitation sent successfully')
  }

  const handleRemoveMember = (teamId: string, memberId: string) => {
    setTeams(teams.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          members: team.members.filter(m => m.id !== memberId),
        }
      }
      return team
    }))
    toast.success('Member removed')
  }

  const handleDeleteTeam = (teamId: string) => {
    setTeams(teams.filter(t => t.id !== teamId))
    toast.success('Team deleted')
  }

  const openInviteDialog = (team: Team) => {
    setSelectedTeam(team)
    setInviteDialogOpen(true)
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default'
      case 'admin':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Teams</h1>
          <p className="mt-1 text-muted-foreground">
            Create and manage teams to collaborate on scheduling.
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new team</DialogTitle>
              <DialogDescription>
                Teams allow you to collaborate with others on scheduling and share event types.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="team-name">Team name</Label>
                <Input
                  id="team-name"
                  placeholder="e.g., Engineering"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTeam}>Create Team</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Teams List */}
      {teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Users className="size-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-foreground">No teams yet</h3>
          <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
            Create your first team to start collaborating with others on scheduling.
          </p>
          <Button onClick={() => setCreateDialogOpen(true)} className="mt-6 gap-2">
            <Plus className="size-4" />
            Create Team
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {teams.map((team) => (
            <Card key={team.id} className="border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
                    <Users className="size-6 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                    <CardDescription>/{team.slug}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => openInviteDialog(team)}
                  >
                    <UserPlus className="size-4" />
                    Invite
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Settings2 className="mr-2 size-4" />
                        Team Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteTeam(team.id)}
                      >
                        Delete Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {team.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-background p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="bg-muted text-sm">
                            {member.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getRoleBadgeVariant(member.role)}>
                          {member.role}
                        </Badge>
                        {member.role !== 'owner' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Make Admin</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleRemoveMember(team.id, member.id)}
                              >
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Invite Member Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite team member</DialogTitle>
            <DialogDescription>
              Send an invitation to join {selectedTeam?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email address</Label>
              <div className="flex gap-2">
                <Mail className="size-4 text-muted-foreground mt-3" />
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteMember}>Send Invitation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
