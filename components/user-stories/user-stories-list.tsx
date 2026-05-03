'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Search, BookOpen, ArrowRight, TestTube2, UserCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

import { getProjects, getUserStories, getTestCases, getModules } from '@/lib/store'
import type { Project, UserStory, TestCase, Module, UserStoryStatus, UserStoryPriority } from '@/lib/types'
import { useAuth } from '@/components/auth/auth-provider'

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

const priorityLabels: Record<UserStoryPriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica',
}

const priorityColors: Record<UserStoryPriority, string> = {
  low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
}

interface StoryWithMeta {
  story: UserStory
  project: Project | undefined
  module: Module | undefined
  testCases: TestCase[]
}

export function UserStoriesList() {
  const { sesion } = useAuth()
  const [items, setItems] = useState<StoryWithMeta[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [allModules, setAllModules] = useState<Module[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [moduleFilter, setModuleFilter] = useState<string>('all')
  const [assignedFilter, setAssignedFilter] = useState<string>('all')

  useEffect(() => {
    const load = async () => {
      try {
        const projs = (await getProjects()).filter((p) => p.status !== 'archived')
        setProjects(projs)

        const results: StoryWithMeta[] = []
        const allMods: Module[] = []
        for (const p of projs) {
          const [stories, tcs, mods] = await Promise.all([
            getUserStories(p.id),
            getTestCases(p.id),
            getModules(p.id),
          ])
          allMods.push(...mods)
          stories.forEach((story) => {
            results.push({
              story,
              project: p,
              module: mods.find((m) => m.id === story.moduleId),
              testCases: tcs.filter((tc) => tc.userStoryId === story.id),
            })
          })
        }
        setItems(results)
        setAllModules(allMods)
      } catch {
        toast.error('Error al cargar las historias')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const visibleModules = useMemo(() => {
    if (projectFilter === 'all') return allModules
    return allModules.filter((m) => {
      const proj = projects.find((p) => p.id === projectFilter)
      return proj && items.some((i) => i.story.projectId === proj.id && i.story.moduleId === m.id)
    })
  }, [allModules, projectFilter, projects, items])

  const filtered = useMemo(() => {
    return items.filter(({ story }) => {
      const matchesSearch =
        story.title.toLowerCase().includes(search.toLowerCase()) ||
        story.code.toLowerCase().includes(search.toLowerCase()) ||
        story.asA.toLowerCase().includes(search.toLowerCase()) ||
        story.iWant.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || story.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || story.priority === priorityFilter
      const matchesProject = projectFilter === 'all' || story.projectId === projectFilter
      const matchesModule = moduleFilter === 'all'
        ? true
        : moduleFilter === 'none'
          ? !story.moduleId
          : story.moduleId === moduleFilter
      const matchesAssigned = assignedFilter === 'all'
        ? true
        : assignedFilter === 'me'
          ? story.assignedTo === sesion?.id
          : story.assignedTo !== null
      return matchesSearch && matchesStatus && matchesPriority && matchesProject && matchesModule && matchesAssigned
    })
  }, [items, search, statusFilter, priorityFilter, projectFilter, moduleFilter, assignedFilter, sesion])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-9 w-40" />
        </div>
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-balance">Historias de Usuario</h1>
          <p className="text-muted-foreground">Gestiona los requisitos funcionales de tus proyectos</p>
        </div>
        <Button asChild>
          <Link href="/historias/nueva">
            <Plus className="mr-2 size-4" />
            Nueva Historia
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar historias..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Proyecto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los proyectos</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(statusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {Object.entries(priorityLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={moduleFilter} onValueChange={(v) => setModuleFilter(v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Módulo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los módulos</SelectItem>
            <SelectItem value="none">Sin módulo</SelectItem>
            {visibleModules.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={assignedFilter} onValueChange={setAssignedFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Asignación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="me">
              <span className="flex items-center gap-1.5">
                <UserCheck className="size-3.5" />
                Asignadas a mí
              </span>
            </SelectItem>
            <SelectItem value="assigned">Con asignación</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="size-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No hay historias</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              {search || statusFilter !== 'all' || priorityFilter !== 'all' || projectFilter !== 'all' || moduleFilter !== 'all' || assignedFilter !== 'all'
                ? 'No se encontraron historias con los filtros seleccionados'
                : 'Crea tu primera historia de usuario para comenzar'}
            </p>
            {!search && statusFilter === 'all' && priorityFilter === 'all' && projectFilter === 'all' && moduleFilter === 'all' && assignedFilter === 'all' && (
              <Button className="mt-4" asChild>
                <Link href="/historias/nueva">
                  <Plus className="mr-2 size-4" />
                  Crear Historia
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(({ story, project, module, testCases }) => {
            const passedTests = testCases.filter((tc) => tc.status === 'passed').length
            return (
              <Link key={story.id} href={`/historias/${story.id}`} className="block">
                <Card className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono text-muted-foreground">{story.code}</span>
                          <Badge variant="outline" className="text-xs">{project?.name}</Badge>
                          {module && (
                            <Badge variant="outline" className="text-xs">{module.name}</Badge>
                          )}
                        </div>
                        <h3 className="font-semibold mt-1">{story.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          <span className="font-medium">Como</span> {story.asA},{' '}
                          <span className="font-medium">quiero</span> {story.iWant},{' '}
                          <span className="font-medium">para</span> {story.soThat}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <TestTube2 className="size-3" />
                            {passedTests}/{testCases.length} pruebas
                          </span>
                          <span>{story.acceptanceCriteria.length} criterios de aceptación</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={statusColors[story.status]}>
                          {statusLabels[story.status]}
                        </Badge>
                        <Badge className={priorityColors[story.priority]}>
                          {priorityLabels[story.priority]}
                        </Badge>
                        <ArrowRight className="size-4 text-muted-foreground mt-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
