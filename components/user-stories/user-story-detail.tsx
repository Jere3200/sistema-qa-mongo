'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Pencil,
  Trash2,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  TestTube2,
  ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
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

import {
  getUserStory,
  getProject,
  getModules,
  getTestCasesByUserStory,
  updateUserStory,
  deleteUserStory,
} from '@/lib/store'
import type { UserStory, Project, Module, TestCase, UserStoryStatus, TestCaseStatus } from '@/lib/types'

const statusLabels: Record<UserStoryStatus, string> = {
  backlog: 'Backlog',
  'in-progress': 'En Progreso',
  testing: 'En Pruebas',
  done: 'Completado',
}

const statusColors: Record<UserStoryStatus, string> = {
  backlog: 'bg-muted text-muted-foreground',
  'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  testing: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
}

const priorityLabels = { low: 'Baja', medium: 'Media', high: 'Alta', critical: 'Crítica' }
const priorityColors = {
  low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
}

const testStatusLabels: Record<TestCaseStatus, string> = {
  pending: 'Pendiente',
  passed: 'Aprobado',
  failed: 'Fallido',
  blocked: 'Bloqueado',
}

const testStatusColors: Record<TestCaseStatus, string> = {
  pending: 'bg-muted text-muted-foreground',
  passed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  failed: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  blocked: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
}

interface UserStoryDetailProps {
  storyId: string
}

export function UserStoryDetail({ storyId }: UserStoryDetailProps) {
  const router = useRouter()
  const [story, setStory] = useState<UserStory | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [module, setModule] = useState<Module | null>(null)
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const loadData = async () => {
    try {
      const s = await getUserStory(storyId)
      if (!s) return
      const [p, mods, tcs] = await Promise.all([
        getProject(s.projectId),
        getModules(s.projectId),
        getTestCasesByUserStory(storyId),
      ])
      setStory(s)
      setProject(p || null)
      setModule(mods.find((m) => m.id === s.moduleId) || null)
      setTestCases(tcs)
    } catch {
      toast.error('Error al cargar la historia')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [storyId])

  const passedTests = testCases.filter((tc) => tc.status === 'passed').length
  const canComplete = passedTests > 0

  const handleStatusChange = async (newStatus: UserStoryStatus) => {
    if (!story) return
    try {
      await updateUserStory(story.id, { status: newStatus })
      await loadData()
      toast.success('Estado actualizado')
    } catch (error) {
      if (error instanceof Error) toast.error(error.message)
      else toast.error('Error al actualizar el estado')
    }
  }

  const handleDelete = async () => {
    if (!story) return
    try {
      await deleteUserStory(story.id)
      toast.success('Historia eliminada')
      router.push('/historias')
    } catch {
      toast.error('Error al eliminar la historia')
    }
  }

  const getTestIcon = (status: TestCaseStatus) => {
    switch (status) {
      case 'passed': return <CheckCircle2 className="size-4 text-emerald-500" />
      case 'failed': return <XCircle className="size-4 text-red-500" />
      case 'blocked': return <AlertTriangle className="size-4 text-purple-500" />
      default: return <Clock className="size-4 text-muted-foreground" />
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl space-y-6">
        <Skeleton className="h-12 w-80" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    )
  }

  if (!story || !project) return null

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-mono text-muted-foreground">{story.code}</span>
            <Badge variant="outline">{project.name}</Badge>
            {module && <Badge variant="outline">{module.name}</Badge>}
          </div>
          <h1 className="text-2xl font-bold mt-2">{story.title}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/historias/${story.id}/editar`}>
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Estado:</span>
          <Select value={story.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value} disabled={value === 'done' && !canComplete}>
                  {label}
                  {value === 'done' && !canComplete && ' (requiere TC aprobado)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Badge className={priorityColors[story.priority]}>
          Prioridad: {priorityLabels[story.priority]}
        </Badge>
      </div>

      {!canComplete && story.status !== 'done' && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg flex items-center gap-3">
          <AlertTriangle className="size-5 text-amber-500" />
          <p className="text-sm">
            Esta historia no puede marcarse como completada hasta que tenga al menos un caso de prueba aprobado.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Historia de Usuario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Como</p>
              <p className="text-sm">{story.asA}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quiero</p>
              <p className="text-sm">{story.iWant}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Para</p>
              <p className="text-sm">{story.soThat}</p>
            </div>
          </div>
          <Separator />
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm italic">
              &ldquo;Como <strong>{story.asA}</strong>, quiero <strong>{story.iWant}</strong>, para{' '}
              <strong>{story.soThat}</strong>.&rdquo;
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Criterios de Aceptación</CardTitle>
          <CardDescription>
            {story.acceptanceCriteria.length} criterio{story.acceptanceCriteria.length !== 1 ? 's' : ''}{' '}
            definido{story.acceptanceCriteria.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {story.acceptanceCriteria.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay criterios de aceptación definidos
            </p>
          ) : (
            <ul className="space-y-2">
              {story.acceptanceCriteria.map((criterion, index) => (
                <li key={criterion.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="flex items-center justify-center size-6 rounded-full bg-primary text-primary-foreground text-xs font-medium shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-sm">{criterion.description}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TestTube2 className="size-5" />
              Casos de Prueba
            </CardTitle>
            <CardDescription>{passedTests}/{testCases.length} aprobados</CardDescription>
          </div>
          <Button asChild>
            <Link href={`/casos-prueba/nuevo?historia=${story.id}`}>
              <Plus className="mr-2 size-4" />
              Nuevo Caso de Prueba
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {testCases.length === 0 ? (
            <div className="text-center py-8">
              <TestTube2 className="size-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No hay casos de prueba asociados</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href={`/casos-prueba/nuevo?historia=${story.id}`}>
                  <Plus className="mr-2 size-4" />
                  Crear primer caso de prueba
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {testCases.map((tc) => (
                <Link
                  key={tc.id}
                  href={`/casos-prueba/${tc.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getTestIcon(tc.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">{tc.code}</span>
                        <span className="text-sm font-medium">{tc.title}</span>
                      </div>
                      {tc.executedAt && (
                        <p className="text-xs text-muted-foreground">
                          Ejecutado por {tc.executedBy} el{' '}
                          {tc.executedAt.toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={testStatusColors[tc.status]}>
                      {testStatusLabels[tc.status]}
                    </Badge>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground">
        Creado el{' '}
        {story.createdAt.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}{' '}
        &middot; Última actualización{' '}
        {story.updatedAt.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Historia de Usuario</DialogTitle>
            <DialogDescription>
              Esta acción eliminará permanentemente la historia{' '}
              <strong>{story.code} - {story.title}</strong> y todos sus casos de prueba asociados (
              {testCases.length}).
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
