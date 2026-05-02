'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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

import {
  getProjects,
  getUserStories,
  getTestCase,
  createTestCase,
  updateTestCase,
} from '@/lib/store'
import type { Project, UserStory, TestCase, TestCaseStatus, TestCasePriority } from '@/lib/types'

interface TestCaseFormProps {
  testCaseId?: string
}

const statusOptions: { value: TestCaseStatus; label: string }[] = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'passed', label: 'Aprobado' },
  { value: 'failed', label: 'Fallido' },
  { value: 'blocked', label: 'Bloqueado' },
]

const priorityOptions: { value: TestCasePriority; label: string }[] = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
]

export function TestCaseForm({ testCaseId }: TestCaseFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultUserStoryId = searchParams.get('historia') || ''

  const [isLoading, setIsLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [allUserStories, setAllUserStories] = useState<UserStory[]>([])
  const [projectUserStories, setProjectUserStories] = useState<UserStory[]>([])
  const [existingTC, setExistingTC] = useState<TestCase | null>(null)

  const [projectId, setProjectId] = useState('')
  const [userStoryId, setUserStoryId] = useState(defaultUserStoryId)
  const [title, setTitle] = useState('')
  const [preconditions, setPreconditions] = useState('')
  const [given, setGiven] = useState('')
  const [when, setWhen] = useState('')
  const [then, setThen] = useState('')
  const [status, setStatus] = useState<TestCaseStatus>('pending')
  const [priority, setPriority] = useState<TestCasePriority>('medium')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        const projs = (await getProjects()).filter((p) => p.status !== 'archived')
        setProjects(projs)

        const storiesArrays = await Promise.all(projs.map((p) => getUserStories(p.id)))
        const allStories = storiesArrays.flat()
        setAllUserStories(allStories)

        let tc: TestCase | null = null
        if (testCaseId) {
          tc = (await getTestCase(testCaseId)) || null
          setExistingTC(tc)
        }

        if (tc) {
          setProjectId(tc.projectId)
          setUserStoryId(tc.userStoryId)
          setTitle(tc.title)
          setPreconditions(tc.preconditions)
          setGiven(tc.given)
          setWhen(tc.when)
          setThen(tc.then)
          setStatus(tc.status)
          setPriority(tc.priority)
          setNotes(tc.notes)
        } else if (defaultUserStoryId) {
          const defaultStory = allStories.find((us) => us.id === defaultUserStoryId)
          if (defaultStory) setProjectId(defaultStory.projectId)
        }
      } catch {
        toast.error('Error al cargar los datos')
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [testCaseId])

  useEffect(() => {
    setProjectUserStories(allUserStories.filter((us) => us.projectId === projectId))
    if (projectId && !allUserStories.find((us) => us.id === userStoryId && us.projectId === projectId)) {
      setUserStoryId('')
    }
  }, [projectId, allUserStories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectId) { toast.error('Selecciona un proyecto'); return }
    if (!userStoryId) { toast.error('Selecciona una historia de usuario'); return }
    if (!title.trim()) { toast.error('El título es requerido'); return }
    if (!given.trim() || !when.trim() || !then.trim()) {
      toast.error('Completa el formato Gherkin (Given/When/Then)')
      return
    }

    setIsSubmitting(true)
    try {
      if (existingTC) {
        await updateTestCase(existingTC.id, {
          projectId, userStoryId,
          title: title.trim(), preconditions: preconditions.trim(),
          given: given.trim(), when: when.trim(), then: then.trim(),
          status, priority, notes: notes.trim(),
        })
        toast.success('Caso de prueba actualizado')
        router.push(`/casos-prueba/${existingTC.id}`)
      } else {
        const newTC = await createTestCase({
          projectId, userStoryId,
          title: title.trim(), preconditions: preconditions.trim(),
          given: given.trim(), when: when.trim(), then: then.trim(),
          status, priority, notes: notes.trim(),
          executedAt: null, executedBy: null,
        })
        toast.success('Caso de prueba creado')
        router.push(`/casos-prueba/${newTC.id}`)
      }
    } catch {
      toast.error('Error al guardar el caso de prueba')
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
          {existingTC ? 'Editar Caso de Prueba' : 'Nuevo Caso de Prueba'}
        </h1>
        <p className="text-muted-foreground">
          {existingTC
            ? 'Modifica los datos del caso de prueba'
            : 'Define un caso de prueba usando el formato Gherkin'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
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
                <FieldLabel htmlFor="userStory">Historia de Usuario</FieldLabel>
                <Select value={userStoryId} onValueChange={setUserStoryId} disabled={!projectId}>
                  <SelectTrigger id="userStory">
                    <SelectValue placeholder="Seleccionar historia" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectUserStories.map((us) => (
                      <SelectItem key={us.id} value={us.id}>
                        {us.code} - {us.title}
                      </SelectItem>
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
                placeholder="Ej: Validar login exitoso con credenciales correctas"
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="status">Estado</FieldLabel>
                <Select value={status} onValueChange={(v) => setStatus(v as TestCaseStatus)}>
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
                <Select value={priority} onValueChange={(v) => setPriority(v as TestCasePriority)}>
                  <SelectTrigger id="priority"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="preconditions">Precondiciones</FieldLabel>
              <Textarea
                id="preconditions"
                value={preconditions}
                onChange={(e) => setPreconditions(e.target.value)}
                placeholder="Ej: Usuario registrado en el sistema. Navegador Chrome 90+"
                rows={2}
              />
              <FieldDescription>Estado inicial necesario antes de ejecutar el caso</FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Escenario Gherkin</CardTitle>
          <CardDescription>Define el comportamiento usando el formato Given/When/Then</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="given" className="text-primary font-mono">Given (Dado que)</FieldLabel>
              <Textarea
                id="given"
                value={given}
                onChange={(e) => setGiven(e.target.value)}
                placeholder="Ej: el usuario está en la página de login"
                rows={2}
                className="font-mono"
              />
              <FieldDescription>El contexto o estado inicial del escenario</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="when" className="text-primary font-mono">When (Cuando)</FieldLabel>
              <Textarea
                id="when"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                placeholder="Ej: ingresa credenciales válidas y hace clic en Iniciar Sesión"
                rows={2}
                className="font-mono"
              />
              <FieldDescription>La acción que desencadena el comportamiento</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="then" className="text-primary font-mono">Then (Entonces)</FieldLabel>
              <Textarea
                id="then"
                value={then}
                onChange={(e) => setThen(e.target.value)}
                placeholder="Ej: el usuario es redirigido al dashboard"
                rows={2}
                className="font-mono"
              />
              <FieldDescription>El resultado esperado</FieldDescription>
            </Field>
          </FieldGroup>

          <div className="mt-4 p-4 bg-muted rounded-lg font-mono text-sm">
            <p><span className="text-primary font-bold">Given</span> {given || '[contexto]'}</p>
            <p><span className="text-primary font-bold">When</span> {when || '[acción]'}</p>
            <p><span className="text-primary font-bold">Then</span> {then || '[resultado]'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notas adicionales</CardTitle>
        </CardHeader>
        <CardContent>
          <Field>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones, datos de prueba específicos, etc."
              rows={3}
            />
          </Field>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : existingTC ? 'Guardar cambios' : 'Crear caso de prueba'}
        </Button>
      </div>
    </form>
  )
}
