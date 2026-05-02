'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  TestTube2,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react'

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

import { getProjects, getUserStories, getTestCases } from '@/lib/store'
import type { Project, UserStory, TestCase, TestCaseStatus } from '@/lib/types'

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

function StatusIcon({ status }: { status: TestCaseStatus }) {
  switch (status) {
    case 'passed': return <CheckCircle2 className="size-4 text-emerald-500" />
    case 'failed': return <XCircle className="size-4 text-red-500" />
    case 'blocked': return <AlertTriangle className="size-4 text-purple-500" />
    default: return <Clock className="size-4 text-muted-foreground" />
  }
}

interface TCWithMeta {
  tc: TestCase
  project: Project | undefined
  userStory: UserStory | undefined
}

export function TestCasesList() {
  const [items, setItems] = useState<TCWithMeta[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [projectFilter, setProjectFilter] = useState<string>('all')

  useEffect(() => {
    const load = async () => {
      try {
        const projs = (await getProjects()).filter((p) => p.status !== 'archived')
        setProjects(projs)

        const results: TCWithMeta[] = []
        for (const p of projs) {
          const [stories, tcs] = await Promise.all([getUserStories(p.id), getTestCases(p.id)])
          tcs.forEach((tc) => {
            results.push({
              tc,
              project: p,
              userStory: stories.find((us) => us.id === tc.userStoryId),
            })
          })
        }
        setItems(results)
      } catch {
        toast.error('Error al cargar los casos de prueba')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    return items.filter(({ tc }) => {
      const matchesSearch =
        tc.title.toLowerCase().includes(search.toLowerCase()) ||
        tc.code.toLowerCase().includes(search.toLowerCase()) ||
        tc.given.toLowerCase().includes(search.toLowerCase()) ||
        tc.when.toLowerCase().includes(search.toLowerCase()) ||
        tc.then.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || tc.status === statusFilter
      const matchesProject = projectFilter === 'all' || tc.projectId === projectFilter
      return matchesSearch && matchesStatus && matchesProject
    })
  }, [items, search, statusFilter, projectFilter])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-9 w-44" />
        </div>
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-balance">Casos de Prueba</h1>
          <p className="text-muted-foreground">Gestiona los casos de prueba y su ejecución</p>
        </div>
        <Button asChild>
          <Link href="/casos-prueba/nuevo">
            <Plus className="mr-2 size-4" />
            Nuevo Caso de Prueba
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar casos de prueba..."
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
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TestTube2 className="size-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No hay casos de prueba</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              {search || statusFilter !== 'all' || projectFilter !== 'all'
                ? 'No se encontraron casos de prueba con los filtros seleccionados'
                : 'Crea tu primer caso de prueba para comenzar'}
            </p>
            {!search && statusFilter === 'all' && projectFilter === 'all' && (
              <Button className="mt-4" asChild>
                <Link href="/casos-prueba/nuevo">
                  <Plus className="mr-2 size-4" />
                  Crear Caso de Prueba
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(({ tc, project, userStory }) => (
            <Link key={tc.id} href={`/casos-prueba/${tc.id}`} className="block">
              <Card className="hover:bg-accent/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusIcon status={tc.status} />
                        <span className="text-xs font-mono text-muted-foreground">{tc.code}</span>
                        <Badge variant="outline" className="text-xs">{project?.name}</Badge>
                        {userStory && (
                          <Badge variant="outline" className="text-xs">{userStory.code}</Badge>
                        )}
                      </div>
                      <h3 className="font-semibold mt-1">{tc.title}</h3>
                      <div className="mt-2 text-sm text-muted-foreground font-mono">
                        <p><span className="text-primary font-semibold">Given</span> {tc.given}</p>
                        <p><span className="text-primary font-semibold">When</span> {tc.when}</p>
                        <p><span className="text-primary font-semibold">Then</span> {tc.then}</p>
                      </div>
                      {tc.executedAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Ejecutado por {tc.executedBy} el{' '}
                          {tc.executedAt.toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={statusColors[tc.status]}>{statusLabels[tc.status]}</Badge>
                      <ArrowRight className="size-4 text-muted-foreground mt-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
