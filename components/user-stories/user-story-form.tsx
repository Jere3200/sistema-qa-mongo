'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, X, Lightbulb } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldGroup, Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import { HelpTooltip } from '@/components/ui/help-tooltip'

import {
  getProjects,
  getModules,
  getUserStory,
  createUserStory,
  updateUserStory,
  replaceAcceptanceCriteria,
} from '@/lib/store'
import type { Project, Module, UserStory, UserStoryStatus, UserStoryPriority } from '@/lib/types'

interface UserStoryFormProps {
  storyId?: string
}

const statusOptions: { value: UserStoryStatus; label: string }[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'in-progress', label: 'En Progreso' },
  { value: 'testing', label: 'En Pruebas' },
  { value: 'done', label: 'Completado' },
]

const priorityOptions: { value: UserStoryPriority; label: string }[] = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'critical', label: 'Crítica' },
]

export function UserStoryForm({ storyId }: UserStoryFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultProjectId = searchParams.get('proyecto') || ''

  const [isLoading, setIsLoading] = useState(!!storyId)
  const [projects, setProjects] = useState<Project[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [existingStory, setExistingStory] = useState<UserStory | null>(null)

  const [projectId, setProjectId] = useState(defaultProjectId)
  const [moduleId, setModuleId] = useState('')
  const [title, setTitle] = useState('')
  const [asA, setAsA] = useState('')
  const [iWant, setIWant] = useState('')
  const [soThat, setSoThat] = useState('')
  const [status, setStatus] = useState<UserStoryStatus>('backlog')
  const [priority, setPriority] = useState<UserStoryPriority>('medium')
  const [criteria, setCriteria] = useState<string[]>([''])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        const [projs, story] = await Promise.all([
          getProjects().then((p) => p.filter((x) => x.status !== 'archived')),
          storyId ? getUserStory(storyId) : Promise.resolve(null),
        ])
        setProjects(projs)
        if (story) {
          setExistingStory(story)
          setProjectId(story.projectId)
          setModuleId(story.moduleId || '')
          setTitle(story.title)
          setAsA(story.asA)
          setIWant(story.iWant)
          setSoThat(story.soThat)
          setStatus(story.status)
          setPriority(story.priority)
          setCriteria(story.acceptanceCriteria.map((ac) => ac.description).length > 0
            ? story.acceptanceCriteria.map((ac) => ac.description)
            : [''])
        }
      } catch {
        toast.error('Error al cargar los datos')
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [storyId])

  useEffect(() => {
    if (!projectId) { setModules([]); return }
    getModules(projectId)
      .then(setModules)
      .catch(() => {
        setModules([])
        toast.error('Error al cargar los módulos')
      })
  }, [projectId])

  const addCriterion = () => setCriteria([...criteria, ''])
  const removeCriterion = (index: number) => {
    if (criteria.length > 1) setCriteria(criteria.filter((_, i) => i !== index))
  }
  const updateCriterion = (index: number, value: string) => {
    const next = [...criteria]
    next[index] = value
    setCriteria(next)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectId) { toast.error('Selecciona un proyecto'); return }
    if (!title.trim()) { toast.error('El título es requerido'); return }
    if (!asA.trim() || !iWant.trim() || !soThat.trim()) {
      toast.error('Completa el formato Como/Quiero/Para')
      return
    }

    setIsSubmitting(true)
    try {
      const validCriteria = criteria.filter((c) => c.trim())

      if (existingStory) {
        await updateUserStory(existingStory.id, {
          projectId,
          moduleId: moduleId || null,
          title: title.trim(),
          asA: asA.trim(),
          iWant: iWant.trim(),
          soThat: soThat.trim(),
          status,
          priority,
        })
        await replaceAcceptanceCriteria(existingStory.id, validCriteria)
        toast.success('Historia actualizada')
        router.push(`/historias/${existingStory.id}`)
      } else {
        const newStory = await createUserStory({
          projectId,
          moduleId: moduleId || null,
          title: title.trim(),
          asA: asA.trim(),
          iWant: iWant.trim(),
          soThat: soThat.trim(),
          status,
          priority,
          assignedTo: null,
        })
        await replaceAcceptanceCriteria(newStory.id, validCriteria)
        toast.success('Historia creada')
        router.push(`/historias/${newStory.id}`)
      }
    } catch (error) {
      if (error instanceof Error) toast.error(error.message)
      else toast.error('Error al guardar la historia')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {existingStory ? 'Editar Historia de Usuario' : 'Nueva Historia de Usuario'}
        </h1>
        <p className="text-muted-foreground">
          {existingStory
            ? 'Modifica los datos de la historia de usuario'
            : 'Define un requisito funcional usando el formato Como/Quiero/Para'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Información General</CardTitle>
            <HelpTooltip content="Asocia la historia a un proyecto y opcionalmente a un módulo específico." />
          </div>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="project">Proyecto</FieldLabel>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger id="project">
                    <SelectValue placeholder="Seleccionar proyecto" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="module">Módulo (opcional)</FieldLabel>
                <Select
                  value={moduleId || 'none'}
                  onValueChange={(v) => setModuleId(v === 'none' ? '' : v)}
                  disabled={!projectId}
                >
                  <SelectTrigger id="module">
                    <SelectValue placeholder="Sin módulo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin módulo</SelectItem>
                    {modules.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="title">Título</FieldLabel>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Crear nuevo producto"
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="status">Estado</FieldLabel>
                <Select value={status} onValueChange={(v) => setStatus(v as UserStoryStatus)}>
                  <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="priority">Prioridad</FieldLabel>
                <Select value={priority} onValueChange={(v) => setPriority(v as UserStoryPriority)}>
                  <SelectTrigger id="priority"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle>Formato Como/Quiero/Para</CardTitle>
                <HelpTooltip
                  content={
                    <div className="space-y-2">
                      <p className="font-medium">El formato estándar de historias de usuario:</p>
                      <ul className="text-xs space-y-1">
                        <li><strong>Como</strong>: Define quién es el usuario</li>
                        <li><strong>Quiero</strong>: Qué funcionalidad necesita</li>
                        <li><strong>Para</strong>: Por qué lo necesita</li>
                      </ul>
                    </div>
                  }
                />
              </div>
              <CardDescription>Define la historia usando el formato estándar</CardDescription>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600">
              <Lightbulb className="h-3 w-3" />
              <span>Tip: Enfócate en el valor de negocio</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="asA">Como (rol)</FieldLabel>
              <Input
                id="asA"
                value={asA}
                onChange={(e) => setAsA(e.target.value)}
                placeholder="Ej: administrador de inventario"
              />
              <FieldDescription>El rol o tipo de usuario que realiza la acción</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="iWant">Quiero (acción)</FieldLabel>
              <Textarea
                id="iWant"
                value={iWant}
                onChange={(e) => setIWant(e.target.value)}
                placeholder="Ej: poder crear nuevos productos en el sistema"
                rows={2}
              />
              <FieldDescription>La funcionalidad o acción que se desea realizar</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="soThat">Para (beneficio)</FieldLabel>
              <Textarea
                id="soThat"
                value={soThat}
                onChange={(e) => setSoThat(e.target.value)}
                placeholder="Ej: mantener actualizado el catálogo de productos"
                rows={2}
              />
              <FieldDescription>El beneficio o valor que se obtiene</FieldDescription>
            </Field>
          </FieldGroup>

          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm">
              <span className="font-semibold">Resumen:</span>{' '}
              <span className="font-medium">Como</span>{' '}
              <span className="text-primary">{asA || '[rol]'}</span>,{' '}
              <span className="font-medium">quiero</span>{' '}
              <span className="text-primary">{iWant || '[acción]'}</span>,{' '}
              <span className="font-medium">para</span>{' '}
              <span className="text-primary">{soThat || '[beneficio]'}</span>.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Criterios de Aceptación</CardTitle>
          <CardDescription>
            Define las condiciones que deben cumplirse para considerar la historia como completa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {criteria.map((criterion, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="flex items-center justify-center size-6 rounded bg-muted text-xs font-medium mt-2">
                  {index + 1}
                </div>
                <Input
                  value={criterion}
                  onChange={(e) => updateCriterion(index, e.target.value)}
                  placeholder={`Criterio ${index + 1}`}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCriterion(index)}
                  disabled={criteria.length <= 1}
                  className="shrink-0"
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addCriterion} className="mt-3">
            <Plus className="mr-2 size-4" />
            Agregar criterio
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : existingStory ? 'Guardar cambios' : 'Crear historia'}
        </Button>
      </div>
    </form>
  )
}
