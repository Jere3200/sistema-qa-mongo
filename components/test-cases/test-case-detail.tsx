'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Pencil,
  Trash2,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  BookOpen,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'

import { getTestCase, getProject, getUserStory, executeTestCase, deleteTestCase } from '@/lib/store'
import { useAuth } from '@/components/auth/auth-provider'
import type { TestCase, Project, UserStory, TestCaseStatus } from '@/lib/types'

const statusLabels: Record<TestCaseStatus, string> = {
  pending: 'Pendiente',
  passed: 'Aprobado',
  failed: 'Fallido',
  blocked: 'Bloqueado',
}

const statusColors: Record<TestCaseStatus, string> = {
  pending: 'bg-muted text-muted-foreground',
  passed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  failed: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  blocked: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
}

const priorityLabels = { low: 'Baja', medium: 'Media', high: 'Alta' }

interface TestCaseDetailProps {
  testCaseId: string
}

export function TestCaseDetail({ testCaseId }: TestCaseDetailProps) {
  const router = useRouter()
  const { sesion } = useAuth()
  const [testCase, setTestCase] = useState<TestCase | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [userStory, setUserStory] = useState<UserStory | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [executeDialogOpen, setExecuteDialogOpen] = useState(false)
  const [executeStatus, setExecuteStatus] = useState<TestCaseStatus>('passed')
  const [executedBy, setExecutedBy] = useState('')
  const [executeNotes, setExecuteNotes] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)

  const loadData = async () => {
    try {
      const tc = await getTestCase(testCaseId)
      if (!tc) return
      const [p, us] = await Promise.all([getProject(tc.projectId), getUserStory(tc.userStoryId)])
      setTestCase(tc)
      setProject(p || null)
      setUserStory(us || null)
    } catch {
      toast.error('Error al cargar el caso de prueba')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [testCaseId])

  useEffect(() => {
    if (sesion?.nombre) setExecutedBy(sesion.nombre)
  }, [sesion])

  const getStatusIcon = (status: TestCaseStatus) => {
    switch (status) {
      case 'passed': return <CheckCircle2 className="size-5 text-emerald-500" />
      case 'failed': return <XCircle className="size-5 text-red-500" />
      case 'blocked': return <AlertTriangle className="size-5 text-purple-500" />
      default: return <Clock className="size-5 text-muted-foreground" />
    }
  }

  const handleExecute = async () => {
    if (!testCase) return
    if (!executedBy.trim()) {
      toast.error('Ingresa quién ejecutó la prueba')
      return
    }
    setIsExecuting(true)
    try {
      await executeTestCase(testCase.id, executeStatus, executedBy.trim(), executeNotes.trim())
      await loadData()
      setExecuteDialogOpen(false)
      setExecuteNotes('')
      toast.success(`Caso de prueba marcado como ${statusLabels[executeStatus].toLowerCase()}`)
    } catch {
      toast.error('Error al registrar la ejecución')
    } finally {
      setIsExecuting(false)
    }
  }

  const handleDelete = async () => {
    if (!testCase) return
    try {
      await deleteTestCase(testCase.id)
      toast.success('Caso de prueba eliminado')
      router.push('/casos-prueba')
    } catch {
      toast.error('Error al eliminar')
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl space-y-6">
        <Skeleton className="h-12 w-80" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  if (!testCase || !project || !userStory) return null

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            {getStatusIcon(testCase.status)}
            <span className="text-sm font-mono text-muted-foreground">{testCase.code}</span>
            <Badge variant="outline">{project.name}</Badge>
            <Link href={`/historias/${userStory.id}`}>
              <Badge variant="outline" className="hover:bg-accent cursor-pointer">
                <BookOpen className="size-3 mr-1" />
                {userStory.code}
              </Badge>
            </Link>
          </div>
          <h1 className="text-2xl font-bold mt-2">{testCase.title}</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setExecuteDialogOpen(true)}>
            <Play className="mr-2 size-4" />
            Ejecutar
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/casos-prueba/${testCase.id}/editar`}>
              <Pencil className="mr-2 size-4" />
              Editar
            </Link>
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 size-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Badge className={`${statusColors[testCase.status]} text-sm px-3 py-1`}>
          {statusLabels[testCase.status]}
        </Badge>
        <Badge variant="outline">Prioridad: {priorityLabels[testCase.priority]}</Badge>
        {testCase.executedAt && (
          <span className="text-sm text-muted-foreground">
            Última ejecución:{' '}
            {testCase.executedAt.toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}{' '}
            por {testCase.executedBy}
          </span>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="size-4" />
            Historia de Usuario Vinculada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Link
            href={`/historias/${userStory.id}`}
            className="block p-4 rounded-lg border hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">{userStory.code}</span>
              <span className="font-medium">{userStory.title}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Como {userStory.asA}, quiero {userStory.iWant}
            </p>
          </Link>
        </CardContent>
      </Card>

      {testCase.preconditions && (
        <Card>
          <CardHeader>
            <CardTitle>Precondiciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{testCase.preconditions}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Escenario de Prueba</CardTitle>
          <CardDescription>Formato Gherkin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted rounded-lg font-mono text-sm space-y-2">
            <p>
              <span className="text-primary font-bold">Given</span> {testCase.given}
            </p>
            <p>
              <span className="text-primary font-bold">When</span> {testCase.when}
            </p>
            <p>
              <span className="text-primary font-bold">Then</span> {testCase.then}
            </p>
          </div>
        </CardContent>
      </Card>

      {testCase.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{testCase.notes}</p>
          </CardContent>
        </Card>
      )}

      <div className="text-xs text-muted-foreground">
        Creado el{' '}
        {testCase.createdAt.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}{' '}
        &middot; Última actualización{' '}
        {testCase.updatedAt.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
      </div>

      <Dialog open={executeDialogOpen} onOpenChange={setExecuteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ejecutar Caso de Prueba</DialogTitle>
            <DialogDescription>Registra el resultado de la ejecución</DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel>Resultado</FieldLabel>
              <Select value={executeStatus} onValueChange={(v) => setExecuteStatus(v as TestCaseStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passed">Aprobado</SelectItem>
                  <SelectItem value="failed">Fallido</SelectItem>
                  <SelectItem value="blocked">Bloqueado</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Ejecutado por</FieldLabel>
              <Input
                value={executedBy}
                onChange={(e) => setExecutedBy(e.target.value)}
                placeholder="Tu nombre"
              />
            </Field>
            <Field>
              <FieldLabel>Notas (opcional)</FieldLabel>
              <Textarea
                value={executeNotes}
                onChange={(e) => setExecuteNotes(e.target.value)}
                placeholder="Observaciones de la ejecución..."
                rows={3}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExecuteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleExecute} disabled={isExecuting}>
              {isExecuting ? 'Guardando...' : 'Registrar Ejecución'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Caso de Prueba</DialogTitle>
            <DialogDescription>
              Esta acción eliminará permanentemente el caso de prueba{' '}
              <strong>{testCase.code} - {testCase.title}</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
