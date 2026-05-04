'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Plus,
  BookOpen,
  TestTube2,
  Layers,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowRight,
  Users,
  UserCheck,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

import { getProject, getModules, getUserStories, getTestCases, deleteModule, updateUserStory, updateTestCase, getProjectMembers } from '@/lib/store'
import type { Project, Module, UserStory, TestCase } from '@/lib/types'
import type { ProjectMember } from '@/lib/db/projects'
import { getAvatarColor, getAvatarInitial } from '@/lib/utils/avatar-color'
import { ModuleDialog } from './module-dialog'
import { ChatPanel } from '@/components/collaboration/chat-panel'
import { PresenceAvatars } from '@/components/collaboration/presence-avatars'
import { InviteMemberDialog } from '@/components/collaboration/invite-member-dialog'
import { useAuth } from '@/components/auth/auth-provider'
import {
  DropdownMenu as AssignDropdown,
  DropdownMenuContent as AssignContent,
  DropdownMenuItem as AssignItem,
  DropdownMenuTrigger as AssignTrigger,
  DropdownMenuSeparator as AssignSeparator,
} from '@/components/ui/dropdown-menu'

const statusColors = {
  backlog: 'bg-muted text-muted-foreground',
  'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  testing: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
}

const statusLabels = {
  backlog: 'Backlog',
  'in-progress': 'En Progreso',
  testing: 'En Pruebas',
  done: 'Completado',
}

interface ProjectDetailProps {
  projectId: string
}

export function ProjectDetail({ projectId }: ProjectDetailProps) {
  const { sesion } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [userStories, setUserStories] = useState<UserStory[]>([])
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [moduleDialogOpen, setModuleDialogOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [moduleToDelete, setModuleToDelete] = useState<Module | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

  const loadData = async () => {
    try {
      const [p, m, us, tc, mem] = await Promise.all([
        getProject(projectId),
        getModules(projectId),
        getUserStories(projectId),
        getTestCases(projectId),
        getProjectMembers(projectId).catch(() => []),
      ])
      if (!p) return
      setProject(p)
      setModules(m)
      setUserStories(us)
      setTestCases(tc)
      setMembers(mem)
    } catch {
      toast.error('Error al cargar el proyecto')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [projectId])

  const completedStories = userStories.filter((s) => s.status === 'done').length
  const passedTests = testCases.filter((t) => t.status === 'passed').length
  const storiesWithTests = new Set(testCases.map((t) => t.userStoryId)).size
  const coveragePercent =
    userStories.length > 0 ? Math.round((storiesWithTests / userStories.length) * 100) : 0

  const handleDeleteModule = async () => {
    if (!moduleToDelete) return
    try {
      await deleteModule(moduleToDelete.id)
      await loadData()
      setDeleteDialogOpen(false)
      setModuleToDelete(null)
      toast.success('Módulo eliminado')
    } catch {
      toast.error('Error al eliminar el módulo')
    }
  }

  const unassignedStories = userStories.filter((s) => !s.moduleId)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-balance">{project.name}</h1>
          <p className="text-muted-foreground mt-1">{project.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <PresenceAvatars projectId={projectId} />
          <Button variant="outline" size="sm" onClick={() => setInviteOpen(true)}>
            <Users className="mr-2 size-4" />
            Colaboradores
          </Button>
          <Button variant="outline" size="sm" onClick={() => setChatOpen(!chatOpen)}>
            Chat
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Layers className="size-4 text-muted-foreground" />
              Módulos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modules.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="size-4 text-muted-foreground" />
              Historias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedStories}/{userStories.length}
            </div>
            <p className="text-xs text-muted-foreground">completadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TestTube2 className="size-4 text-muted-foreground" />
              Pruebas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {passedTests}/{testCases.length}
            </div>
            <p className="text-xs text-muted-foreground">aprobadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cobertura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coveragePercent}%</div>
            <Progress value={coveragePercent} className="h-2 mt-1" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="modules">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="modules">Por Módulos</TabsTrigger>
            <TabsTrigger value="all">Todas las Historias</TabsTrigger>
            <TabsTrigger value="tasks">
              <UserCheck className="size-3.5 mr-1.5" />
              Asignaciones
            </TabsTrigger>
            <TabsTrigger value="metrics">
              Métricas
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setEditingModule(null); setModuleDialogOpen(true) }}>
              <Plus className="mr-2 size-4" />
              Nuevo Módulo
            </Button>
            <Button asChild>
              <Link href={`/historias/nueva?proyecto=${projectId}`}>
                <Plus className="mr-2 size-4" />
                Nueva Historia
              </Link>
            </Button>
          </div>
        </div>

        <TabsContent value="modules" className="mt-4 space-y-4">
          {modules.map((module) => {
            const moduleStories = userStories.filter((s) => s.moduleId === module.id)
            return (
              <Card key={module.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{module.name}</CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditingModule(module); setModuleDialogOpen(true) }}>
                          <Pencil className="mr-2 size-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => { setModuleToDelete(module); setDeleteDialogOpen(true) }}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  {moduleStories.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No hay historias en este módulo
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {moduleStories.map((story) => (
                        <Link
                          key={story.id}
                          href={`/historias/${story.id}`}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-muted-foreground">{story.code}</span>
                            <span className="text-sm font-medium">{story.title}</span>
                          </div>
                          <Badge className={statusColors[story.status]}>
                            {statusLabels[story.status]}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}

          {unassignedStories.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Sin Módulo Asignado</CardTitle>
                <CardDescription>Historias que no pertenecen a ningún módulo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {unassignedStories.map((story) => (
                    <Link
                      key={story.id}
                      href={`/historias/${story.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-muted-foreground">{story.code}</span>
                        <span className="text-sm font-medium">{story.title}</span>
                      </div>
                      <Badge className={statusColors[story.status]}>
                        {statusLabels[story.status]}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {modules.length === 0 && unassignedStories.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Layers className="size-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Sin módulos ni historias</h3>
                <p className="text-muted-foreground text-center max-w-sm">
                  Crea módulos para organizar tus historias de usuario por funcionalidad
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="mt-4 space-y-4">
          <AssignmentsTab
            userStories={userStories}
            testCases={testCases}
            members={members}
            currentUserId={sesion?.id ?? ''}
            onAssignStory={async (storyId, userId) => {
              await updateUserStory(storyId, { assignedTo: userId })
              await loadData()
            }}
            onAssignTestCase={async (tcId, userId) => {
              await updateTestCase(tcId, { assignedTo: userId })
              await loadData()
            }}
          />
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Todas las Historias de Usuario</CardTitle>
              <CardDescription>{userStories.length} historias en total</CardDescription>
            </CardHeader>
            <CardContent>
              {userStories.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No hay historias de usuario en este proyecto
                </p>
              ) : (
                <div className="space-y-2">
                  {userStories.map((story) => {
                    const storyTests = testCases.filter((t) => t.userStoryId === story.id)
                    const module = modules.find((m) => m.id === story.moduleId)
                    return (
                      <Link
                        key={story.id}
                        href={`/historias/${story.id}`}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-muted-foreground">{story.code}</span>
                            <span className="text-sm font-medium">{story.title}</span>
                            {module && (
                              <Badge variant="outline" className="text-xs">{module.name}</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            Como {story.asA}, quiero {story.iWant}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">{storyTests.length} TC</span>
                          <Badge className={statusColors[story.status]}>
                            {statusLabels[story.status]}
                          </Badge>
                          <ArrowRight className="size-4 text-muted-foreground" />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

        <TabsContent value="metrics" className="mt-4">
          <ProjectMetricsTab
            userStories={userStories}
            testCases={testCases}
            modules={modules}
          />
        </TabsContent>

      <ModuleDialog
        open={moduleDialogOpen}
        onOpenChange={setModuleDialogOpen}
        projectId={projectId}
        module={editingModule}
        onSuccess={loadData}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Módulo</DialogTitle>
            <DialogDescription>
              Esta acción eliminará el módulo <strong>{moduleToDelete?.name}</strong>. Las historias
              de usuario asociadas no se eliminarán, pero quedarán sin módulo asignado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteModule}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} projectId={projectId} />

      {chatOpen && <ChatPanel projectId={projectId} onClose={() => setChatOpen(false)} />}
    </div>
  )
}

interface AssignmentsTabProps {
  userStories: UserStory[]
  testCases: TestCase[]
  members: ProjectMember[]
  currentUserId: string
  onAssignStory: (storyId: string, userId: string | null) => Promise<void>
  onAssignTestCase: (tcId: string, userId: string | null) => Promise<void>
}

function AssignmentsTab({ userStories, testCases, members, currentUserId, onAssignStory, onAssignTestCase }: AssignmentsTabProps) {
  const getMemberName = (userId: string | null) => {
    if (!userId) return null
    return members.find((m) => m.userId === userId)?.nombre ?? null
  }

  const AssignButton = ({
    assignedTo,
    onAssign,
    onUnassign,
  }: {
    assignedTo: string | null
    onAssign: (userId: string | null) => void
    onUnassign: () => void
  }) => {
    const name = getMemberName(assignedTo)
    const assignedColor = name ? getAvatarColor(name) : null
    return (
      <AssignDropdown>
        <AssignTrigger asChild>
          <button className={`flex items-center gap-1.5 text-xs rounded-full px-2.5 py-1 border transition-colors ${
            assignedTo ? 'bg-muted/60 border-border text-foreground hover:bg-muted' : 'bg-muted border-border text-muted-foreground hover:bg-muted/80'
          }`}>
            {assignedTo && name ? (
              <>
                <span className={`size-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${assignedColor?.bg} ${assignedColor?.text}`}>
                  {getAvatarInitial(name)}
                </span>
                {name}
              </>
            ) : (
              <>
                <Users className="size-3" />
                Asignar
              </>
            )}
          </button>
        </AssignTrigger>
        <AssignContent align="end" className="w-48">
          {currentUserId && !members.find(m => m.userId === currentUserId) ? null : (
            <AssignItem onClick={() => onAssign(currentUserId)}>
              <UserCheck className="mr-2 size-4 text-teal-600" />
              Asignarme
            </AssignItem>
          )}
          {members.filter((m) => m.userId !== currentUserId).map((m) => {
            const { bg, text } = getAvatarColor(m.nombre)
            return (
              <AssignItem key={m.userId} onClick={() => onAssign(m.userId)}>
                <span className={`size-5 rounded-full flex items-center justify-center text-xs font-bold mr-2 shrink-0 ${bg} ${text}`}>
                  {getAvatarInitial(m.nombre)}
                </span>
                {m.nombre}
              </AssignItem>
            )
          })}
          {assignedTo && (
            <>
              <AssignSeparator />
              <AssignItem onClick={onUnassign} className="text-destructive focus:text-destructive">
                <X className="mr-2 size-4" />
                Quitar asignación
              </AssignItem>
            </>
          )}
        </AssignContent>
      </AssignDropdown>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="size-4 text-purple-500" />
            Historias de Usuario
          </CardTitle>
          <CardDescription className="text-xs">Asigná responsables a cada historia</CardDescription>
        </CardHeader>
        <CardContent>
          {userStories.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No hay historias en este proyecto</p>
          ) : (
            <div className="space-y-2">
              {userStories.map((story) => (
                <div key={story.id} className="flex items-center justify-between p-3 rounded-lg border gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground shrink-0">{story.code}</span>
                      <span className="text-sm font-medium truncate">{story.title}</span>
                    </div>
                  </div>
                  <AssignButton
                    assignedTo={story.assignedTo}
                    onAssign={(uid) => onAssignStory(story.id, uid)}
                    onUnassign={() => onAssignStory(story.id, null)}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TestTube2 className="size-4 text-teal-500" />
            Casos de Prueba
          </CardTitle>
          <CardDescription className="text-xs">Asigná testers a cada caso</CardDescription>
        </CardHeader>
        <CardContent>
          {testCases.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No hay casos de prueba en este proyecto</p>
          ) : (
            <div className="space-y-2">
              {testCases.map((tc) => (
                <div key={tc.id} className="flex items-center justify-between p-3 rounded-lg border gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground shrink-0">{tc.code}</span>
                      <span className="text-sm font-medium truncate">{tc.title}</span>
                    </div>
                  </div>
                  <AssignButton
                    assignedTo={tc.assignedTo}
                    onAssign={(uid) => onAssignTestCase(tc.id, uid)}
                    onUnassign={() => onAssignTestCase(tc.id, null)}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface ProjectMetricsTabProps {
  userStories: UserStory[]
  testCases: TestCase[]
  modules: Module[]
}

const storyStatusConfig = [
  { key: 'backlog' as const, label: 'Backlog', barColor: 'bg-gray-400' },
  { key: 'in-progress' as const, label: 'En Progreso', barColor: 'bg-blue-500' },
  { key: 'testing' as const, label: 'En Pruebas', barColor: 'bg-amber-500' },
  { key: 'done' as const, label: 'Completado', barColor: 'bg-emerald-500' },
]

const testStatusConfig = [
  { key: 'pending' as const, label: 'Pendiente', barColor: 'bg-gray-400' },
  { key: 'passed' as const, label: 'Aprobado', barColor: 'bg-emerald-500' },
  { key: 'failed' as const, label: 'Fallido', barColor: 'bg-red-500' },
  { key: 'blocked' as const, label: 'Bloqueado', barColor: 'bg-purple-500' },
]

function ProjectMetricsTab({ userStories, testCases, modules }: ProjectMetricsTabProps) {
  const storiesWithTests = new Set(testCases.map((t) => t.userStoryId)).size
  const coveragePercent = userStories.length > 0 ? Math.round((storiesWithTests / userStories.length) * 100) : 0
  const completedStories = userStories.filter((s) => s.status === 'done').length
  const completionPercent = userStories.length > 0 ? Math.round((completedStories / userStories.length) * 100) : 0

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="size-4 text-purple-500" />
              Historias por Estado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {storyStatusConfig.map(({ key, label, barColor }) => {
              const count = userStories.filter((s) => s.status === key).length
              const pct = userStories.length > 0 ? Math.round((count / userStories.length) * 100) : 0
              return (
                <div key={key} className="flex items-center gap-3">
                  <div className="w-24 text-xs text-muted-foreground shrink-0">{label}</div>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="w-10 text-right text-xs text-muted-foreground shrink-0">{count} ({pct}%)</div>
                </div>
              )
            })}
            <div className="pt-2 border-t text-xs text-muted-foreground flex justify-between">
              <span>Total: {userStories.length} historias</span>
              <span className="font-medium text-emerald-600">{completionPercent}% completado</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TestTube2 className="size-4 text-teal-500" />
              Casos de Prueba por Estado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {testStatusConfig.map(({ key, label, barColor }) => {
              const count = testCases.filter((t) => t.status === key).length
              const pct = testCases.length > 0 ? Math.round((count / testCases.length) * 100) : 0
              return (
                <div key={key} className="flex items-center gap-3">
                  <div className="w-24 text-xs text-muted-foreground shrink-0">{label}</div>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="w-10 text-right text-xs text-muted-foreground shrink-0">{count} ({pct}%)</div>
                </div>
              )
            })}
            <div className="pt-2 border-t text-xs text-muted-foreground flex justify-between">
              <span>Total: {testCases.length} casos</span>
              <span className="font-medium text-emerald-600">
                {testCases.length > 0 ? Math.round((testCases.filter(t => t.status === 'passed').length / testCases.length) * 100) : 0}% aprobados
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Cobertura por Módulo</CardTitle>
        </CardHeader>
        <CardContent>
          {modules.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No hay módulos definidos</p>
          ) : (
            <div className="space-y-3">
              {modules.map((mod) => {
                const modStories = userStories.filter((s) => s.moduleId === mod.id)
                const modTests = testCases.filter((tc) => modStories.some((s) => s.id === tc.userStoryId))
                const modCoverage = modStories.length > 0
                  ? Math.round((new Set(modTests.map(t => t.userStoryId)).size / modStories.length) * 100)
                  : 0
                return (
                  <div key={mod.id} className="flex items-center gap-3">
                    <div className="w-32 text-xs font-medium truncate shrink-0">{mod.name}</div>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${modCoverage === 100 ? 'bg-emerald-500' : modCoverage >= 50 ? 'bg-amber-500' : 'bg-red-400'}`}
                        style={{ width: `${modCoverage}%` }}
                      />
                    </div>
                    <div className="w-24 text-right text-xs text-muted-foreground shrink-0">
                      {modCoverage}% — {modStories.length} historias
                    </div>
                  </div>
                )
              })}
              <div className="pt-2 border-t flex items-center gap-3">
                <div className="w-32 text-xs font-semibold shrink-0">Total proyecto</div>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-teal-500 transition-all duration-500" style={{ width: `${coveragePercent}%` }} />
                </div>
                <div className="w-24 text-right text-xs font-medium shrink-0">{coveragePercent}% cobertura</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
