'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  FolderKanban,
  BookOpen,
  TestTube2,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Lightbulb,
  GraduationCap,
  HelpCircle,
  Zap,
  Info,
  TrendingUp,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { getDashboardStats, getProjects, getUserStories, getTestCases } from '@/lib/store'
import type { Project, UserStory, TestCase, DashboardStats } from '@/lib/types'

const STATUS_LABELS = {
  backlog: 'Backlog',
  'in-progress': 'En Progreso',
  testing: 'En Pruebas',
  done: 'Completado',
  pending: 'Pendiente',
  passed: 'Aprobado',
  failed: 'Fallido',
  blocked: 'Bloqueado',
} as const

const STATUS_COLORS = {
  backlog: 'bg-gray-100 text-gray-600',
  'in-progress': 'bg-blue-100 text-blue-700',
  testing: 'bg-amber-100 text-amber-700',
  done: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-gray-100 text-gray-600',
  passed: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
  blocked: 'bg-purple-100 text-purple-700',
} as const

const STORY_STATUS_BAR_COLOR = {
  backlog: 'bg-gray-300',
  'in-progress': 'bg-blue-500',
  testing: 'bg-amber-500',
  done: 'bg-emerald-500',
} as const

const TEST_STATUS_ICON = {
  passed: { Icon: CheckCircle2, color: 'text-emerald-600', barColor: 'bg-emerald-500' },
  failed: { Icon: XCircle, color: 'text-red-600', barColor: 'bg-red-500' },
  blocked: { Icon: AlertTriangle, color: 'text-purple-600', barColor: 'bg-purple-500' },
  pending: { Icon: Clock, color: 'text-gray-500', barColor: 'bg-gray-300' },
} as const

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
}

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ElementType
  description: string
  tooltip?: string
  badge?: React.ReactNode
  accentColor?: string
  index: number
}

function StatCard({ title, value, icon: Icon, description, tooltip, badge, accentColor = 'text-teal-600', index }: StatCardProps) {
  return (
    <motion.div custom={index} initial="hidden" animate="visible" variants={cardVariants}>
      <Card className="bg-card border-border/60 hover:border-border transition-colors overflow-hidden">
        <div className={`h-px w-full bg-gradient-to-r from-transparent via-current to-transparent opacity-30 ${accentColor}`} />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {tooltip ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="size-4 text-muted-foreground/50 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-[200px] text-xs">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Icon className={`size-4 ${accentColor} opacity-70`} />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold tracking-tight ${accentColor}`}>{value}</div>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
          {badge && <div className="mt-2">{badge}</div>}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [allUserStories, setAllUserStories] = useState<UserStory[]>([])
  const [allTestCases, setAllTestCases] = useState<TestCase[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [s, projs] = await Promise.all([getDashboardStats(), getProjects()])
        setStats(s)
        const active = projs.filter((p) => p.status === 'active')
        setProjects(active)
        const [stories, tcs] = await Promise.all([
          Promise.all(active.map((p) => getUserStories(p.id))).then((a) => a.flat()),
          Promise.all(active.map((p) => getTestCases(p.id))).then((a) => a.flat()),
        ])
        setAllUserStories(stories)
        setAllTestCases(tcs)
      } catch (err) {
        console.error('[Dashboard] Error al cargar:', err)
        toast.error('Error al cargar el dashboard')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const recentStories = useMemo(
    () => [...allUserStories].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 5),
    [allUserStories]
  )
  const failedTests = useMemo(() => allTestCases.filter((tc) => tc.status === 'failed'), [allTestCases])

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">

        {stats.totalProjects === 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="border-teal-200 bg-teal-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-teal-700">
                  <Zap className="h-5 w-5" />
                  ¡Bienvenido a RQA-Tracer! Empezá aquí
                </CardTitle>
                <CardDescription>
                  Seguí estos 3 pasos para documentar tu primer proyecto correctamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { num: '1', title: 'Creá un Proyecto', desc: 'El contenedor principal de tu trabajo de análisis y QA', href: '/proyectos', label: 'Ir a Proyectos', primary: true },
                    { num: '2', title: 'Escribí Historias', desc: 'Documentá los requisitos desde la perspectiva del usuario', href: '/historias', label: 'Ver Historias', primary: false },
                    { num: '3', title: 'Creá Casos de Prueba', desc: 'Vinculá cada prueba a su historia para garantizar cobertura', href: '/casos-prueba', label: 'Ver Casos', primary: false },
                  ].map((step) => (
                    <div key={step.num} className="flex items-start gap-3 rounded-xl border border-border/50 bg-card p-4">
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${step.primary ? 'bg-teal-500 text-black' : 'bg-muted text-muted-foreground'}`}>
                        {step.num}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="text-sm font-semibold">{step.title}</div>
                        <div className="text-xs text-muted-foreground leading-relaxed">{step.desc}</div>
                        <Button size="sm" variant={step.primary ? 'default' : 'outline'} asChild className="mt-2 h-7 text-xs">
                          <Link href={step.href}>{step.label}<ArrowRight className="ml-1 h-3 w-3" /></Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    { href: '/aprender', icon: Lightbulb, label: 'Cómo crear un sistema' },
                    { href: '/guia', icon: HelpCircle, label: 'Guía del Analista' },
                    { href: '/metodologia', icon: GraduationCap, label: 'Ciclo SDLC' },
                  ].map((link) => (
                    <Button key={link.href} variant="ghost" size="sm" asChild className="text-xs h-8">
                      <Link href={link.href}><link.icon className="mr-1.5 h-3.5 w-3.5" />{link.label}</Link>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard index={0} title="Proyectos Activos" value={stats.totalProjects} icon={FolderKanban} description="proyectos en desarrollo" accentColor="text-blue-600" />
          <StatCard
            index={1}
            title="Historias de Usuario"
            value={stats.totalUserStories}
            icon={BookOpen}
            description="requisitos documentados"
            tooltip='Requisitos en formato "Como [rol], quiero [acción], para [beneficio]"'
            badge={<Badge className="text-xs bg-emerald-100 text-emerald-700 border-0">{stats.userStoriesByStatus.done} completadas</Badge>}
            accentColor="text-purple-600"
          />
          <StatCard
            index={2}
            title="Casos de Prueba"
            value={stats.totalTestCases}
            icon={TestTube2}
            description="escenarios de prueba"
            tooltip="Escenarios Gherkin (Dado/Cuando/Entonces) vinculados a historias"
            badge={
              <div className="flex gap-1.5 flex-wrap">
                <Badge className="text-xs bg-emerald-100 text-emerald-700 border-0">{stats.testCasesByStatus.passed} aprobados</Badge>
                {stats.testCasesByStatus.failed > 0 && (
                  <Badge className="text-xs bg-red-100 text-red-700 border-0">{stats.testCasesByStatus.failed} fallidos</Badge>
                )}
              </div>
            }
            accentColor="text-teal-600"
          />
          <StatCard
            index={3}
            title="Cobertura"
            value={`${stats.coveragePercentage}%`}
            icon={TrendingUp}
            description="historias con casos de prueba"
            tooltip="Porcentaje de historias que tienen al menos un caso de prueba. Meta: 100%"
            badge={<Progress value={stats.coveragePercentage} className="h-1.5 mt-1" />}
            accentColor="text-emerald-600"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <motion.div custom={4} initial="hidden" animate="visible" variants={cardVariants}>
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Estado de Historias</CardTitle>
                <CardDescription className="text-xs">Distribución por estado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(Object.entries(stats.userStoriesByStatus) as [keyof typeof STORY_STATUS_BAR_COLOR, number][]).map(([status, count]) => {
                    const pct = stats.totalUserStories > 0 ? Math.round((count / stats.totalUserStories) * 100) : 0
                    const barColor = STORY_STATUS_BAR_COLOR[status] ?? 'bg-zinc-600'
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <div className="w-24 text-xs font-medium text-muted-foreground shrink-0">
                          {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
                        </div>
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
                        </div>
                        <div className="w-8 text-xs text-muted-foreground text-right shrink-0">{count}</div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div custom={5} initial="hidden" animate="visible" variants={cardVariants}>
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Estado de Pruebas</CardTitle>
                <CardDescription className="text-xs">Resultados de los casos de prueba</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(Object.entries(stats.testCasesByStatus) as [keyof typeof TEST_STATUS_ICON, number][]).map(([status, count]) => {
                    const pct = stats.totalTestCases > 0 ? Math.round((count / stats.totalTestCases) * 100) : 0
                    const { Icon, color, barColor } = TEST_STATUS_ICON[status] ?? { Icon: Clock, color: 'text-gray-500', barColor: 'bg-gray-300' }
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <Icon className={`size-3.5 shrink-0 ${color}`} />
                        <div className="w-20 text-xs font-medium text-muted-foreground shrink-0">
                          {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
                        </div>
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
                        </div>
                        <div className="w-8 text-xs text-muted-foreground text-right shrink-0">{count}</div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <motion.div custom={6} initial="hidden" animate="visible" variants={cardVariants}>
            <Card className="border-border/60">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base">Historias Recientes</CardTitle>
                  <CardDescription className="text-xs">Últimas actualizadas</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild className="text-xs h-8">
                  <Link href="/historias">Ver todas<ArrowRight className="ml-1 size-3.5" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentStories.map((story) => (
                    <Link
                      key={story.id}
                      href={`/historias/${story.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/40 transition-colors group"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground shrink-0">{story.code}</span>
                          <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">{story.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">Como {story.asA}, quiero {story.iWant}</p>
                      </div>
                      <Badge className={`ml-2 text-xs shrink-0 border-0 ${STATUS_COLORS[story.status]}`}>
                        {STATUS_LABELS[story.status]}
                      </Badge>
                    </Link>
                  ))}
                  {recentStories.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">No hay historias de usuario aún</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div custom={7} initial="hidden" animate="visible" variants={cardVariants}>
            <Card className={`border-border/60 ${failedTests.length > 0 ? 'border-red-200' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    {failedTests.length > 0 && <AlertTriangle className="size-4 text-red-500" />}
                    Pruebas Fallidas
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {failedTests.length > 0 ? 'Casos que requieren atención' : 'Sin pruebas fallidas actualmente'}
                  </CardDescription>
                </div>
                {failedTests.length > 0 && (
                  <Button variant="ghost" size="sm" asChild className="text-xs h-8">
                    <Link href="/casos-prueba">Ver todas<ArrowRight className="ml-1 size-3.5" /></Link>
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {failedTests.slice(0, 5).map((tc) => (
                    <Link key={tc.id} href={`/casos-prueba/${tc.id}`} className="flex items-center justify-between p-3 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 transition-colors">
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground shrink-0">{tc.code}</span>
                          <span className="text-sm font-medium truncate text-red-800">{tc.title}</span>
                        </div>
                        {tc.notes && <p className="text-xs text-muted-foreground truncate">{tc.notes}</p>}
                      </div>
                      <XCircle className="size-4 text-red-500 shrink-0 ml-2" />
                    </Link>
                  ))}
                  {failedTests.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                      <CheckCircle2 className="size-10 text-emerald-500" />
                      <p className="text-sm font-medium text-emerald-400">Todas las pruebas pasando</p>
                      <p className="text-xs text-muted-foreground">No hay casos de prueba fallidos</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div custom={8} initial="hidden" animate="visible" variants={cardVariants}>
          <Card className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">Proyectos Activos</CardTitle>
                <CardDescription className="text-xs">Resumen de proyectos en desarrollo</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-xs h-8">
                <Link href="/proyectos">Ver todos<ArrowRight className="ml-1 size-3.5" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => {
                  const pStories = allUserStories.filter((s) => s.projectId === project.id)
                  const pTests = allTestCases.filter((t) => t.projectId === project.id)
                  const completed = pStories.filter((s) => s.status === 'done').length
                  const passed = pTests.filter((t) => t.status === 'passed').length
                  const coverage = pStories.length > 0 ? Math.round((completed / pStories.length) * 100) : 0
                  return (
                    <Link key={project.id} href={`/proyectos/${project.id}`} className="group block p-4 rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/40 hover:border-border transition-all">
                      <h3 className="font-semibold text-sm text-balance group-hover:text-primary transition-colors">{project.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">{project.description}</p>
                      <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><BookOpen className="size-3 text-purple-400" />{completed}/{pStories.length} historias</span>
                        <span className="flex items-center gap-1"><TestTube2 className="size-3 text-teal-400" />{passed}/{pTests.length} pruebas</span>
                      </div>
                      <div className="mt-3 h-1 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-teal-500 transition-all duration-500" style={{ width: `${coverage}%` }} />
                      </div>
                    </Link>
                  )
                })}
                {projects.length === 0 && (
                  <div className="col-span-full text-center py-10">
                    <p className="text-sm text-muted-foreground mb-3">No hay proyectos activos</p>
                    <Button size="sm" asChild><Link href="/proyectos">Crear proyecto</Link></Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </TooltipProvider>
  )
}
