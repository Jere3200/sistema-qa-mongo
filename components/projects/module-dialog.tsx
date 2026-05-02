'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'

import { createModule, updateModule } from '@/lib/store'
import type { Module } from '@/lib/types'

interface ModuleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  module: Module | null
  onSuccess: () => void
}

export function ModuleDialog({ open, onOpenChange, projectId, module, onSuccess }: ModuleDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = !!module

  useEffect(() => {
    if (module) {
      setName(module.name)
      setDescription(module.description)
    } else {
      setName('')
      setDescription('')
    }
  }, [module, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    setIsSubmitting(true)
    try {
      if (isEditing) {
        await updateModule(module.id, { name: name.trim(), description: description.trim() })
        toast.success('Módulo actualizado')
      } else {
        await createModule({ projectId, name: name.trim(), description: description.trim(), order: 0 })
        toast.success('Módulo creado')
      }
      onSuccess()
      onOpenChange(false)
    } catch {
      toast.error('Error al guardar el módulo')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Módulo' : 'Nuevo Módulo'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Modifica los datos del módulo'
                : 'Los módulos agrupan historias de usuario por funcionalidad'}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="name">Nombre del módulo</FieldLabel>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Gestión de Usuarios"
                autoFocus
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="description">Descripción</FieldLabel>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe brevemente la funcionalidad del módulo..."
                rows={3}
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear módulo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
