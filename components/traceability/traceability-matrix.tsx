'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  AlertCircle,
  Search,
  Download,
  FileText,
  ChevronDown,
  ChevronRight,
  TestTube2,
  BookOpen,
} from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { toast } from 'sonner'

import { getProjects, getTraceabilityMatrix, getModules } from '@/lib/store'
import type { Project, Module, TraceabilityRow, TestCaseStatus, UserStoryStatus } from '@/lib/types'

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

const coverageColors = {
  none: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  partial: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  full: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
}

const coverageLabels = { none: 'Sin cobertura', partial: 'Parcial', full: 'Completa' }

const testStatusIcons: Record<TestCaseStatus, React.ReactNode> = {
  pending: <Clock className="size-4 text-muted-foreground" />,
  passed: <CheckCircle2 className="size-4 text-emerald-500" />,
  failed: <XCircle className="size-4 text-red-500" />,
  blocked: <AlertTriangle className="size-4 text-purple-500" />,
}

export function TraceabilityMatrix() {
  const [projects, setProjects] = useState<Project[]>([])
  const [matrix, setMatrix] = useState<TraceabilityRow[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMatrixLoading, setIsMatrixLoading] = useState(false)

  const [search, setSearch] = useState('')
  const [projectFilter, setProjectFilter] = useState<string>('')
  const [coverageFilter, setCoverageFilter] = useState<string>('all')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  useEffect(() => {
    getProjects()
      .then((p) => {
        const active = p.filter((x) => x.status !== 'archived')
        setProjects(active)
        if (active.length > 0) setProjectFilter(active[0].id)
      })
      .catch(() => toast.error('Error al cargar los proyectos'))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    if (!projectFilter) return
    setIsMatrixLoading(true)
    Promise.all([getTraceabilityMatrix(projectFilter), getModules(projectFilter)])
      .then(([m, mods]) => { setMatrix(m); setModules(mods) })
      .catch(() => toast.error('Error al cargar la matriz'))
      .finally(() => setIsMatrixLoading(false))
  }, [projectFilter])

  const filteredMatrix = useMemo(() => {
    return matrix.filter((row) => {
      const matchesSearch =
        row.userStory.code.toLowerCase().includes(search.toLowerCase()) ||
        row.userStory.title.toLowerCase().includes(search.toLowerCase())
      const matchesCoverage = coverageFilter === 'all' || row.coverage === coverageFilter
      return matchesSearch && matchesCoverage
    })
  }, [matrix, search, coverageFilter])

  const stats = useMemo(() => {
    const total = matrix.length
    const withTests = matrix.filter((r) => r.testCases.length > 0).length
    const fullCoverage = matrix.filter((r) => r.coverage === 'full').length
    const noCoverage = matrix.filter((r) => r.coverage === 'none').length
    const canComplete = matrix.filter((r) => r.canComplete).length
    return {
      total, withTests, fullCoverage, noCoverage, canComplete,
      coveragePercent: total > 0 ? Math.round((withTests / total) * 100) : 0,
      completionReadyPercent: total > 0 ? Math.round((canComplete / total) * 100) : 0,
    }
  }, [matrix])

  const toggleRow = (id: string) => {
    const next = new Set(expandedRows)
    if (next.has(id)) next.delete(id); else next.add(id)
    setExpandedRows(next)
  }

  const exportCSV = () => {
    const project = projects.find((p) => p.id === projectFilter)
    const csv = [
      ['Código US', 'Título', 'Estado', 'Cobertura', 'Puede Completarse', 'Casos de Prueba', 'TC Aprobados', 'TC Fallidos'].join(','),
      ...filteredMatrix.map((row) =>
        [
          row.userStory.code,
          `"${row.userStory.title.replace(/"/g, '""')}"`,
          statusLabels[row.userStory.status],
          coverageLabels[row.coverage],
          row.canComplete ? 'Sí' : 'No',
          row.testCases.length,
          row.testCases.filter((tc) => tc.status === 'passed').length,
          row.testCases.filter((tc) => tc.status === 'failed').length,
        ].join(',')
      ),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `trazabilidad-${project?.name || 'proyecto'}-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    toast.success('CSV exportado')
  }

  const exportPDF = () => {
    const project = projects.find((p) => p.id === projectFilter)
    const projectName = project?.name || 'Proyecto'
    const dateStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })

    const doc = new jsPDF({ orientation: 'landscape' })
    doc.setFontSize(16)
    doc.setTextColor(20, 120, 120)
    doc.text(`Matriz de Trazabilidad — ${projectName}`, 14, 18)
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(9)
    doc.text(`Generado el ${dateStr}  |  Cobertura: ${stats.coveragePercent}%  |  Historias: ${stats.total}  |  Sin cobertura: ${stats.noCoverage}`, 14, 25)

    const tableRows = filteredMatrix.map((row) => {
      const mod = modules.find((m) => m.id === row.userStory.moduleId)
      return [
        row.userStory.code,
        row.userStory.title.length > 55 ? row.userStory.title.substring(0, 52) + '...' : row.userStory.title,
        mod?.name ?? '—',
        statusLabels[row.userStory.status],
        coverageLabels[row.coverage],
        row.canComplete ? 'Sí' : 'No',
        String(row.testCases.length),
        String(row.testCases.filter((tc) => tc.status === 'passed').length),
        String(row.testCases.filter((tc) => tc.status === 'failed').length),
      ]
    })

    autoTable(doc, {
      head: [['Código', 'Historia de Usuario', 'Módulo', 'Estado US', 'Cobertura', 'Completable', 'TCs', '✓ OK', '✗ Fail']],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [20, 184, 166], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 250, 250] },
      columnStyles: {
        0: { cellWidth: 18, fontStyle: 'bold' },
        1: { cellWidth: 70 },
        2: { cellWidth: 30 },
        3: { cellWidth: 28 },
        4: { cellWidth: 25 },
        5: { cellWidth: 22, halign: 'center' },
        6: { cellWidth: 12, halign: 'center' },
        7: { cellWidth: 12, halign: 'center' },
        8: { cellWidth: 12, halign: 'center' },
      },
    })

    const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(7)
      doc.setTextColor(150)
      doc.text(`RQA-Tracer  |  Página ${i} de ${pageCount}`, 14, doc.internal.pageSize.height - 8)
    }

    doc.save(`trazabilidad-${projectName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`)
    toast.success('PDF generado')
  }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-balance">Matriz de Trazabilidad</h1>
          <p className="text-muted-foreground">
            Visualiza la relación entre historias de usuario y casos de prueba
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV} disabled={!projectFilter}>
            <Download className="mr-2 size-4" />
            CSV
          </Button>
          <Button variant="outline" onClick={exportPDF} disabled={!projectFilter}>
            <FileText className="mr-2 size-4" />
            PDF
          </Button>
        </div>
      </div>

      {projectFilter && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Historias de Usuario</CardTitle>
            </CardHeader>
            <div className="px-6 pb-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">en el proyecto</p>
            </div>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cobertura</CardTitle>
            </CardHeader>
            <div className="px-6 pb-4">
              <div className="text-2xl font-bold">{stats.coveragePercent}%</div>
              <Progress value={stats.coveragePercent} className="h-2 mt-1" />
              <p className="text-xs text-muted-foreground mt-1">
                {stats.withTests} de {stats.total} con casos de prueba
              </p>
            </div>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Listas para Completar</CardTitle>
            </CardHeader>
            <div className="px-6 pb-4">
              <div className="text-2xl font-bold">{stats.canComplete}</div>
              <Progress value={stats.completionReadyPercent} className="h-2 mt-1" />
              <p className="text-xs text-muted-foreground mt-1">con al menos 1 TC aprobado</p>
            </div>
          </Card>
          <Card className={stats.noCoverage > 0 ? 'border-red-200 dark:border-red-900' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {stats.noCoverage > 0 && <AlertCircle className="size-4 text-red-500" />}
                Sin Cobertura
              </CardTitle>
            </CardHeader>
            <div className="px-6 pb-4">
              <div className="text-2xl font-bold">{stats.noCoverage}</div>
              <p className="text-xs text-muted-foreground">historias sin casos de prueba</p>
            </div>
          </Card>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Seleccionar proyecto" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar historias..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={coverageFilter} onValueChange={setCoverageFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Cobertura" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="none">Sin cobertura</SelectItem>
            <SelectItem value="partial">Parcial</SelectItem>
            <SelectItem value="full">Completa</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpandedRows(new Set(filteredMatrix.map((r) => r.userStory.id)))}
          >
            Expandir todo
          </Button>
          <Button variant="outline" size="sm" onClick={() => setExpandedRows(new Set())}>
            Colapsar todo
          </Button>
        </div>
      </div>

      {!projectFilter ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="size-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Selecciona un proyecto</h3>
          </CardContent>
        </Card>
      ) : isMatrixLoading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : filteredMatrix.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TestTube2 className="size-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Sin resultados</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              {search || coverageFilter !== 'all'
                ? 'No se encontraron historias con los filtros seleccionados'
                : 'No hay historias de usuario en este proyecto'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead className="w-[100px]">Código</TableHead>
                <TableHead>Historia de Usuario</TableHead>
                <TableHead className="w-[120px]">Estado US</TableHead>
                <TableHead className="w-[120px]">Cobertura</TableHead>
                <TableHead className="w-[100px] text-center">Casos</TableHead>
                <TableHead className="w-[120px]">Completable</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMatrix.map((row) => {
                const isExpanded = expandedRows.has(row.userStory.id)
                const mod = modules.find((m) => m.id === row.userStory.moduleId)
                const passedCount = row.testCases.filter((tc) => tc.status === 'passed').length
                const failedCount = row.testCases.filter((tc) => tc.status === 'failed').length

                return (
                  <Collapsible key={row.userStory.id} open={isExpanded} asChild>
                    <>
                      <TableRow className="hover:bg-muted/50">
                        <TableCell>
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-6"
                              onClick={() => toggleRow(row.userStory.id)}
                              disabled={row.testCases.length === 0}
                            >
                              {row.testCases.length > 0 &&
                                (isExpanded
                                  ? <ChevronDown className="size-4" />
                                  : <ChevronRight className="size-4" />)}
                            </Button>
                          </CollapsibleTrigger>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          <Link href={`/historias/${row.userStory.id}`} className="hover:underline text-primary">
                            {row.userStory.code}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div>
                            <Link href={`/historias/${row.userStory.id}`} className="font-medium hover:underline">
                              {row.userStory.title}
                            </Link>
                            {mod && (
                              <Badge variant="outline" className="ml-2 text-xs">{mod.name}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[row.userStory.status]}>
                            {statusLabels[row.userStory.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={coverageColors[row.coverage]}>
                            {coverageLabels[row.coverage]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-medium">{row.testCases.length}</span>
                            {passedCount > 0 && <span className="text-xs text-emerald-600">{passedCount} ok</span>}
                            {failedCount > 0 && <span className="text-xs text-red-600">{failedCount} fail</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          {row.canComplete ? (
                            <div className="flex items-center gap-1 text-emerald-600">
                              <CheckCircle2 className="size-4" />
                              <span className="text-sm">Sí</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <AlertCircle className="size-4" />
                              <span className="text-sm">No</span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                      <CollapsibleContent asChild>
                        <TableRow className="bg-muted/30">
                          <TableCell colSpan={7} className="p-0">
                            <div className="px-8 py-3">
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                Casos de Prueba ({row.testCases.length})
                              </p>
                              <div className="space-y-1">
                                {row.testCases.map((tc) => (
                                  <Link
                                    key={tc.id}
                                    href={`/casos-prueba/${tc.id}`}
                                    className="flex items-center gap-3 p-2 rounded hover:bg-background transition-colors"
                                  >
                                    {testStatusIcons[tc.status]}
                                    <span className="text-xs font-mono text-muted-foreground">{tc.code}</span>
                                    <span className="text-sm">{tc.title}</span>
                                    {tc.executedAt && (
                                      <span className="text-xs text-muted-foreground ml-auto">
                                        {tc.executedAt.toLocaleDateString('es-ES')}
                                      </span>
                                    )}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      </CollapsibleContent>
                    </>
                  </Collapsible>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
