'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Archive,
  BookOpen,
  TestTube2,
  FolderKanban,
  RotateCcw,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

import { getProjects, deleteProject, updateProject } from '@/lib/store'
import type { Project, ProjectStatus } from '@/lib/types'
import { ProjectDialog } from './project-dialog'

const statusConfig: Record<ProjectStatus, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  active: { label: 'Activo', variant: 'default' },
  completed: { label: 'Completado', variant: 'secondary' },
  archived: { label: 'Archivado', variant: 'outline' },
}

export function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'active' | 'archived'>('active')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)

  const loadProjects = async () => {
    try {
      const data = await getProjects()
      setProjects(data)
    } catch {
      toast.error('Error al cargar los proyectos')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadProjects() }, [])

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      const matchesTab =
        tab === 'active' ? p.status === 'active' || p.status === 'completed' : p.status === 'archived'
      return matchesSearch && matchesTab
    })
  }, [projects, search, tab])

  const handleArchive = async (project: Project) => {
    try {
      await updateProject(project.id, { status: 'archived' })
      await loadProjects()
      toast.success('Proyecto archivado')
    } catch {
      toast.error('Error al archivar')
    }
  }

  const handleRestore = async (project: Project) => {
    try {
      await updateProject(project.id, { status: 'active' })
      await loadProjects()
      toast.success('Proyecto restaurado')
    } catch {
      toast.error('Error al restaurar')
    }
  }

  const handleDelete = async () => {
    if (!projectToDelete) return
    try {
      await deleteProject(projectToDelete.id)
      await loadProjects()
      setDeleteDialogOpen(false)
      setProjectToDelete(null)
      toast.success('Proyecto eliminado')
    } catch {
      toast.error('Error al eliminar')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-balance">Proyectos</h1>
          <p className="text-muted-foreground">Gestiona tus proyectos y sus requisitos</p>
        </div>
        <Button onClick={() => { setEditingProject(null); setDialogOpen(true) }}>
          <Plus className="mr-2 size-4" />
          Nuevo Proyecto
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar proyectos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={tab} onValueChange={(v) => setTab(v as 'active' | 'archived')}>
          <TabsList>
            <TabsTrigger value="active">Activos</TabsTrigger>
            <TabsTrigger value="archived">Archivados</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderKanban className="size-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No hay proyectos</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              {search
                ? 'No se encontraron proyectos con ese término de búsqueda'
                : tab === 'archived'
                ? 'No tienes proyectos archivados'
                : 'Crea tu primer proyecto para comenzar a gestionar requisitos'}
            </p>
            {!search && tab === 'active' && (
              <Button className="mt-4" onClick={() => { setEditingProject(null); setDialogOpen(true) }}>
                <Plus className="mr-2 size-4" />
                Crear Proyecto
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => { setEditingProject(project); setDialogOpen(true) }}
              onArchive={() => handleArchive(project)}
              onRestore={() => handleRestore(project)}
              onDelete={() => { setProjectToDelete(project); setDeleteDialogOpen(true) }}
            />
          ))}
        </div>
      )}

      <ProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={editingProject}
        onSuccess={loadProjects}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Proyecto</DialogTitle>
            <DialogDescription>
              Esta acción eliminará permanentemente el proyecto{' '}
              <strong>{projectToDelete?.name}</strong> y todos sus módulos, historias de usuario y
              casos de prueba asociados.
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

interface ProjectCardProps {
  project: Project
  onEdit: () => void
  onArchive: () => void
  onRestore: () => void
  onDelete: () => void
}

function ProjectCard({ project, onEdit, onArchive, onRestore, onDelete }: ProjectCardProps) {
  return (
    <Card className="group relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              <Link href={`/proyectos/${project.id}`} className="hover:underline">
                {project.name}
              </Link>
            </CardTitle>
            <Badge variant={statusConfig[project.status].variant}>
              {statusConfig[project.status].label}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Opciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="mr-2 size-4" />
                Editar
              </DropdownMenuItem>
              {project.status !== 'archived' ? (
                <DropdownMenuItem onClick={onArchive}>
                  <Archive className="mr-2 size-4" />
                  Archivar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={onRestore}>
                  <RotateCcw className="mr-2 size-4" />
                  Restaurar
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="mr-2 size-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{project.description}</p>
        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
          Actualizado{' '}
          {project.updatedAt.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </div>
      </CardContent>
    </Card>
  )
}
