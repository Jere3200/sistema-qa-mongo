'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'

import { createUser, updateUser } from '@/lib/actions/users-actions'
import type { UserListItem } from './users-list'

interface UserDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserListItem | null
  onSuccess: () => void
}

export function UserDrawer({ open, onOpenChange, user, onSuccess }: UserDrawerProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = !!user

  useEffect(() => {
    if (user) {
      setName(user.name ?? '')
      setEmail(user.email ?? '')
    } else {
      setName('')
      setEmail('')
    }
    setPassword('')
  }, [user, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !email.trim()) {
      toast.error('Nombre y email son requeridos')
      return
    }

    setIsSubmitting(true)
    const result = isEditing
      ? await updateUser(user.id, { name, email, password: password || undefined })
      : await createUser({ name, email, password })
    setIsSubmitting(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success(isEditing ? 'Usuario actualizado' : 'Usuario creado')
    onSuccess()
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent>
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          <DrawerHeader>
            <DrawerTitle>{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</DrawerTitle>
            <DrawerDescription>
              {isEditing
                ? 'Modificá los datos del usuario. Dejá la contraseña vacía para no cambiarla.'
                : 'Creá un nuevo usuario con acceso al sistema.'}
            </DrawerDescription>
          </DrawerHeader>

          <FieldGroup className="px-4">
            <Field>
              <FieldLabel htmlFor="user-name">Nombre</FieldLabel>
              <Input
                id="user-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Juan Pérez"
                autoFocus
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="user-email">Email</FieldLabel>
              <Input
                id="user-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@email.com"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="user-password">
                Contraseña {isEditing && <span className="text-muted-foreground">(opcional)</span>}
              </FieldLabel>
              <Input
                id="user-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEditing ? 'Dejar vacío para no cambiarla' : 'Mínimo 6 caracteres'}
              />
            </Field>
          </FieldGroup>

          <DrawerFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear usuario'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
