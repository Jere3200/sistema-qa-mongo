'use client'

import { useState, useEffect } from 'react'
import { UserPlus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import { getProjectMembers, inviteMember, removeMember, getProjectOwnerId } from '@/lib/store'
import { useAuth } from '@/components/auth/auth-provider'
import type { ProjectMember } from '@/lib/types'
import { getAvatarColor, getAvatarInitial } from '@/lib/utils/avatar-color'

interface InviteMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
}

const roleLabels: Record<ProjectMember['role'], string> = {
  owner: 'Propietario',
  editor: 'Editor',
  viewer: 'Visor',
}

export function InviteMemberDialog({ open, onOpenChange, projectId }: InviteMemberDialogProps) {
  const { sesion } = useAuth()
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [ownerId, setOwnerId] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [isInviting, setIsInviting] = useState(false)

  const loadMembers = async () => {
    try {
      const [m, o] = await Promise.all([getProjectMembers(projectId), getProjectOwnerId(projectId)])
      setMembers(m)
      setOwnerId(o)
    } catch (err) {
      console.error('[InviteDialog] loadMembers:', err)
      toast.error('Error al cargar los miembros')
    }
  }

  useEffect(() => {
    if (open) loadMembers()
  }, [open, projectId])

  const handleInvite = async () => {
    if (!email.trim()) return
    setIsInviting(true)
    try {
      await inviteMember(projectId, email.trim())
      setEmail('')
      await loadMembers()
      toast.success('Miembro invitado exitosamente')
    } catch (error) {
      console.error('[InviteDialog] handleInvite:', error)
      if (error instanceof Error) toast.error(error.message)
      else toast.error('Error al invitar al miembro')
    } finally {
      setIsInviting(false)
    }
  }

  const handleRemove = async (userId: string) => {
    try {
      await removeMember(projectId, userId)
      await loadMembers()
      toast.success('Miembro eliminado')
    } catch {
      toast.error('Error al eliminar el miembro')
    }
  }

  const isOwner = sesion?.id === ownerId

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-5" />
            Colaboradores del Proyecto
          </DialogTitle>
          <DialogDescription>
            Invita a otros usuarios para trabajar en conjunto en este proyecto
          </DialogDescription>
        </DialogHeader>

        {isOwner && (
          <FieldGroup className="pt-2">
            <Field>
              <FieldLabel>Invitar por email</FieldLabel>
              <div className="flex gap-2">
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  type="email"
                  onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                />
                <Button onClick={handleInvite} disabled={!email.trim() || isInviting} className="shrink-0">
                  {isInviting ? 'Invitando...' : 'Invitar'}
                </Button>
              </div>
            </Field>
          </FieldGroup>
        )}

        <Separator />

        <div className="space-y-2">
          <p className="text-sm font-medium">{members.length} miembro{members.length !== 1 ? 's' : ''}</p>
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <div className={`size-8 rounded-full flex items-center justify-center text-sm font-semibold ${getAvatarColor(member.nombre).bg} ${getAvatarColor(member.nombre).text}`}>
                  {getAvatarInitial(member.nombre)}
                </div>
                <div>
                  <p className="text-sm font-medium">{member.nombre}</p>
                  <p className="text-xs text-muted-foreground">{roleLabels[member.role]}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                  {roleLabels[member.role]}
                </Badge>
                {isOwner && member.userId !== sesion?.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-destructive hover:text-destructive"
                    onClick={() => handleRemove(member.userId)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
