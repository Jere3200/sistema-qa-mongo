'use client'

import { useRef } from 'react'
import Link from 'next/link'
import {
  TestTube2,
  ArrowRight,
  CheckCircle2,
  Shield,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { Button } from '@/components/ui/button'

// ─── Constantes ───────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const VALUE_PROPS = ['Sin instalación', 'Sin base de datos', '100% en el navegador', 'Gratis']

const TOOL_CARDS = [
  {
    id: 'projects',
    number: '01',
    title: 'Gestión de Proyectos',
    description: 'Organizá tu trabajo en proyectos y módulos. Seguí el estado de cada entregable en tiempo real.',
    colorTag: 'text-blue-600 bg-blue-50',
    colorBg: 'from-blue-50/60',
    colorBorder: 'hover:border-blue-200',
  },
  {
    id: 'stories',
    number: '02',
    title: 'Historias de Usuario',
    description: 'Documentá requisitos en formato estándar con criterios de aceptación verificables y trazables.',
    colorTag: 'text-violet-600 bg-violet-50',
    colorBg: 'from-violet-50/60',
    colorBorder: 'hover:border-violet-200',
  },
  {
    id: 'tests',
    number: '03',
    title: 'Casos de Prueba',
    description: 'Escenarios Gherkin (Dado/Cuando/Entonces) vinculados directamente a cada historia de usuario.',
    colorTag: 'text-teal-600 bg-teal-50',
    colorBg: 'from-teal-50/60',
    colorBorder: 'hover:border-teal-200',
  },
  {
    id: 'matrix',
    number: '04',
    title: 'Matriz de Trazabilidad',
    description: 'Visualizá la cobertura completa. Asegurate de que ningún requisito quede sin su prueba.',
    colorTag: 'text-amber-600 bg-amber-50',
    colorBg: 'from-amber-50/60',
    colorBorder: 'hover:border-amber-200',
  },
]

// ─── MatrixGrid ───────────────────────────────────────────────────────────────

function getCellState(row: number, col: number): 'pass' | 'fail' | 'empty' {
  const seed = row * 3 + col * 7
  if (seed % 5 === 0) return 'empty'
  return (row + col * 2) % 3 === 2 ? 'fail' : 'pass'
}

function MatrixGrid({ rows = 5, cols = 7, small = false }: { rows?: number; cols?: number; small?: boolean }) {
  const cellCls = small ? 'w-5 h-4' : 'w-6 h-5'
  const labelW = small ? 'w-6' : 'w-7'
  return (
    <div className="flex flex-col gap-1">
      <div className={`flex gap-1 ${small ? 'pl-7' : 'pl-8'}`}>
        {Array.from({ length: cols }, (_, c) => (
          <div key={c} className={`text-[8px] text-center text-gray-400 font-mono ${small ? 'w-5' : 'w-6'}`}>
            T{c + 1}
          </div>
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex items-center gap-1">
          <span className={`text-[8px] font-mono text-gray-400 shrink-0 ${labelW}`}>US{r + 1}</span>
          {Array.from({ length: cols }, (_, c) => {
            const state = getCellState(r, c)
            return (
              <div
                key={c}
                className={`rounded-sm ${cellCls} ${
                  state === 'pass' ? 'bg-teal-400' :
                  state === 'fail' ? 'bg-red-400' :
                  'bg-gray-100 border border-dashed border-gray-300'
                }`}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ─── Tool card previews ───────────────────────────────────────────────────────

function ProjectsCardPreview() {
  const projects = [
    { name: 'Sistema QA', progress: 78, color: 'bg-teal-500' },
    { name: 'E-Commerce App', progress: 45, color: 'bg-blue-500' },
    { name: 'API Gateway', progress: 92, color: 'bg-violet-500' },
  ]
  return (
    <div className="w-full space-y-2">
      {projects.map((p) => (
        <div key={p.name} className="flex items-center gap-2.5 rounded-lg bg-white/90 px-3 py-2 shadow-sm border border-gray-100">
          <div className={`h-2 w-2 rounded-full ${p.color} shrink-0`} />
          <span className="flex-1 text-[11px] font-medium text-gray-700 truncate">{p.name}</span>
          <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden shrink-0">
            <div className={`h-full rounded-full ${p.color}`} style={{ width: `${p.progress}%` }} />
          </div>
          <span className="text-[10px] text-gray-500 w-7 text-right shrink-0">{p.progress}%</span>
        </div>
      ))}
    </div>
  )
}

function StoriesCardPreview() {
  return (
    <div className="w-full rounded-lg bg-white/95 border border-violet-100 p-3 shadow-sm text-left">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[9px] font-mono text-violet-500 font-bold">US-007</span>
        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-semibold text-violet-700">En Pruebas</span>
      </div>
      <p className="text-[11px] font-semibold text-gray-800 mb-2 leading-tight">Filtrar productos por categoría</p>
      <div className="space-y-0.5 bg-gray-50 rounded p-2 border border-gray-100">
        <p className="text-[10px] text-gray-500"><span className="font-semibold text-gray-700">Como</span> usuario registrado</p>
        <p className="text-[10px] text-gray-500"><span className="font-semibold text-gray-700">quiero</span> filtrar el catálogo</p>
        <p className="text-[10px] text-gray-500"><span className="font-semibold text-gray-700">para</span> encontrar productos rápido</p>
      </div>
    </div>
  )
}

function TestCasesCardPreview() {
  return (
    <div className="w-full rounded-lg bg-gray-900 p-3 font-mono text-left shadow-md">
      <div className="flex items-center gap-1.5 mb-2.5">
        <span className="h-2 w-2 rounded-full bg-red-400" />
        <span className="h-2 w-2 rounded-full bg-yellow-400" />
        <span className="h-2 w-2 rounded-full bg-green-400" />
        <span className="ml-2 text-[9px] text-gray-500">TC-042 · US-001</span>
      </div>
      <div className="space-y-0.5 text-[10px] leading-relaxed">
        <p><span className="text-violet-400">Escenario:</span><span className="text-gray-300"> Filtro exitoso</span></p>
        <p><span className="text-teal-400">  Dado</span><span className="text-gray-400"> el catálogo con 50 items</span></p>
        <p><span className="text-blue-400">  Cuando</span><span className="text-gray-400"> selecciono &quot;Electrónica&quot;</span></p>
        <p><span className="text-emerald-400">  Entonces</span><span className="text-gray-400"> veo solo 12 productos</span></p>
      </div>
    </div>
  )
}

function MatrixCardPreview() {
  return (
    <div className="w-full rounded-lg bg-white/95 border border-amber-100 p-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] text-gray-400 font-mono">Stories ↓ / Tests →</span>
        <span className="text-[9px] font-semibold text-teal-600">↑ 87% cubierto</span>
      </div>
      <MatrixGrid rows={5} cols={7} />
    </div>
  )
}

// ─── Step mock panels ─────────────────────────────────────────────────────────

function StepFormMock() {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-[9px] text-gray-400 mb-1">Nombre del proyecto</p>
        <div className="h-6 rounded-md bg-gray-100 w-full border border-gray-200 px-2 flex items-center">
          <span className="text-[10px] text-gray-400">Sistema de E-commerce</span>
        </div>
      </div>
      <div>
        <p className="text-[9px] text-gray-400 mb-1">Módulos</p>
        <div className="flex flex-wrap gap-1">
          {['Auth', 'Catálogo', 'Carrito', 'Pago'].map((m) => (
            <span key={m} className="rounded-full bg-gray-100 border border-gray-200 px-2 py-0.5 text-[9px] text-gray-600">{m}</span>
          ))}
          <span className="rounded-full bg-teal-50 border border-teal-200 px-2 py-0.5 text-[9px] text-teal-600">+ agregar</span>
        </div>
      </div>
      <div className="h-6 w-24 rounded-md bg-teal-500 flex items-center justify-center mt-1">
        <span className="text-[10px] font-semibold text-white">Crear proyecto</span>
      </div>
    </div>
  )
}

function StepStoryMock() {
  const criteria = ['Agregar productos', 'Calcular total', 'Vaciar carrito']
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] font-mono text-violet-500">US-003</span>
        <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[8px] text-amber-700">En Progreso</span>
      </div>
      <p className="text-[10px] font-semibold text-gray-800">Gestión de carrito</p>
      {criteria.map((c, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className={`h-3 w-3 rounded-full flex items-center justify-center shrink-0 ${i < 2 ? 'bg-teal-500' : 'bg-gray-200'}`}>
            {i < 2 && <span className="text-[7px] text-white font-bold">✓</span>}
          </div>
          <span className="text-[9px] text-gray-600">{c}</span>
        </div>
      ))}
    </div>
  )
}

function StepMatrixMini() {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] text-gray-400 font-mono">Cobertura</span>
        <span className="text-[9px] font-semibold text-teal-600 font-mono">87%</span>
      </div>
      <MatrixGrid rows={3} cols={4} small />
    </div>
  )
}

// ─── AppMockup ────────────────────────────────────────────────────────────────

function AppMockup() {
  const sidebarItems = ['Dashboard', 'Proyectos', 'Historias', 'Casos de Prueba', 'Trazabilidad']
  const stats = [
    { num: '12', label: 'Proyectos', accent: 'bg-blue-500' },
    { num: '48', label: 'Historias', accent: 'bg-violet-500' },
    { num: '127', label: 'Pruebas', accent: 'bg-teal-500' },
    { num: '94%', label: 'Cobertura', accent: 'bg-emerald-500' },
  ]
  const rows = [
    { code: 'US-001', title: 'Login de usuario', badge: 'Completado', cls: 'text-emerald-700 bg-emerald-50' },
    { code: 'US-002', title: 'Gestión de proyectos', badge: 'En Pruebas', cls: 'text-amber-700 bg-amber-50' },
    { code: 'US-003', title: 'Matriz de trazabilidad', badge: 'En Progreso', cls: 'text-blue-700 bg-blue-50' },
    { code: 'US-004', title: 'Casos de prueba Gherkin', badge: 'Pendiente', cls: 'text-gray-600 bg-gray-100' },
  ]

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-2xl">
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-yellow-400" />
        <span className="h-3 w-3 rounded-full bg-green-400" />
        <div className="flex-1 mx-3 rounded-md bg-white border border-gray-200 h-5 flex items-center px-2">
          <span className="text-[10px] text-gray-400 font-mono">rqa-tracer.vercel.app/dashboard</span>
        </div>
      </div>
      <div className="flex" style={{ height: 300 }}>
        <div className="w-44 bg-gray-900 p-3 flex flex-col gap-1 shrink-0">
          <div className="flex items-center gap-2 mb-3 px-2 py-1">
            <div className="h-6 w-6 rounded-md bg-teal-500 flex items-center justify-center shrink-0">
              <span className="text-[8px] font-bold text-white">QA</span>
            </div>
            <span className="text-[11px] font-semibold text-white">RQA-Tracer</span>
          </div>
          {sidebarItems.map((item, i) => (
            <div
              key={item}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[10px] ${
                i === 0 ? 'bg-teal-500/20 text-teal-300 font-medium' : 'text-gray-500'
              }`}
            >
              <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${i === 0 ? 'bg-teal-400' : 'bg-gray-600'}`} />
              {item}
            </div>
          ))}
        </div>
        <div className="flex-1 p-4 bg-gray-50 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs font-semibold text-gray-800">Dashboard</div>
              <div className="text-[10px] text-gray-400">Resumen del proyecto</div>
            </div>
            <div className="h-6 w-24 rounded-md bg-teal-500 flex items-center justify-center">
              <span className="text-[9px] font-semibold text-white">+ Nuevo proyecto</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {stats.map((s) => (
              <div key={s.label} className="bg-white border border-gray-100 rounded-lg p-2 shadow-sm">
                <div className={`h-0.5 w-6 rounded-full ${s.accent} mb-1.5`} />
                <div className="text-xs font-bold text-gray-800">{s.num}</div>
                <div className="text-[9px] text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            {rows.map((row) => (
              <div key={row.code} className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-1.5 shadow-sm">
                <span className="text-[9px] font-mono text-gray-400 shrink-0 w-10">{row.code}</span>
                <span className="text-[10px] text-gray-700 flex-1 truncate">{row.title}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${row.cls}`}>{row.badge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 shadow-sm">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M4 14L9 4l3 6 4-2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="16" cy="8" r="1.4" fill="#fff" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 tracking-tight">
            RQA<span className="text-teal-600">·</span>Tracer
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {[
            { label: 'Producto', href: '#producto' },
            { label: 'Trazabilidad', href: '#trazabilidad' },
            { label: 'Cómo funciona', href: '#como-funciona' },
          ].map((link) => (
            <a key={link.label} href={link.href} className="text-[13.5px] text-gray-500 hover:text-gray-900 transition-colors font-medium">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" className="hidden sm:flex text-gray-600 hover:text-gray-900" asChild>
            <Link href="/login">Iniciar sesión</Link>
          </Button>
          <Button className="bg-teal-600 text-white hover:bg-teal-700 shadow-sm font-semibold" asChild>
            <Link href="/register">
              Comenzar gratis
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-gray-100 bg-white">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(20,184,166,0.10) 0%, transparent 70%)' }}
      />

      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-2">

          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-xs font-medium text-gray-500">
                <Shield className="h-3 w-3 text-teal-600 shrink-0" />
                Proyecto académico · Datos locales · Sin backend
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.06, ease: EASE }}
              className="text-[2.8rem] sm:text-[3.5rem] lg:text-[4.2rem] font-extrabold leading-[1.04] tracking-tight text-gray-900 text-balance"
            >
              Trazabilidad de{' '}
              <span className="bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent">
                Requisitos
              </span>{' '}
              y{' '}
              <span className="bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent">
                QA
              </span>
              , en un solo lugar.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12, ease: EASE }}
              className="mt-6 text-lg text-gray-500 leading-relaxed max-w-lg text-balance"
            >
              Documentá <strong className="text-gray-900 font-semibold">historias de usuario</strong>,{' '}
              <strong className="text-gray-900 font-semibold">casos de prueba</strong> en Gherkin
              y la trazabilidad completa entre ambos. Garantizá que cada requisito tiene su prueba.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.18, ease: EASE }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Button size="lg" className="h-12 px-7 text-base bg-teal-600 text-white hover:bg-teal-700 font-semibold shadow-md shadow-teal-100" asChild>
                <Link href="/register">
                  Comenzar gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-7 text-base border-gray-200 text-gray-700 hover:bg-gray-50" asChild>
                <Link href="/login">Ya tengo cuenta</Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.26 }}
              className="mt-8 flex flex-wrap gap-5 text-sm text-gray-500"
            >
              {VALUE_PROPS.map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-teal-500 shrink-0" />
                  {item}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Mockup + floating cards */}
          <div className="relative hidden lg:block">
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5, ease: EASE }}
              className="absolute -top-6 -right-4 z-20"
            >
              <motion.div
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="flex items-center gap-2.5 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 shadow-xl"
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-800">94% de cobertura</p>
                  <p className="text-[10px] text-gray-400">Todas las historias cubiertas</p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65, ease: EASE }}
              className="absolute -bottom-6 -left-4 z-20"
            >
              <motion.div
                animate={{ y: [0, 7, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                className="flex items-center gap-2.5 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 shadow-xl"
              >
                <div className="h-8 w-8 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                  <TestTube2 className="h-4 w-4 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">Prueba aprobada</p>
                  <p className="text-[10px] text-gray-400 font-mono">TC-042 · Login de usuario</p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 48 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.34, ease: EASE }}
              style={{ perspective: 1200 }}
            >
              <AppMockup />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Tools Section ────────────────────────────────────────────────────────────

const TOOL_PREVIEWS: Record<string, () => React.JSX.Element> = {
  projects: ProjectsCardPreview,
  stories: StoriesCardPreview,
  tests: TestCasesCardPreview,
  matrix: MatrixCardPreview,
}

function ToolsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="py-28 border-b border-gray-100 bg-white" id="producto">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-16"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-xs font-semibold text-teal-700 font-mono tracking-wider">
            PRODUCTO
          </div>
          <h2 className="text-[2.6rem] font-extrabold tracking-tight text-gray-900 leading-tight max-w-xl">
            Todo lo que necesitás.
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-xl leading-relaxed">
            Cuatro herramientas integradas para cubrir el ciclo completo de requisitos y pruebas.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2">
          {TOOL_CARDS.map((card, i) => {
            const Preview = TOOL_PREVIEWS[card.id]
            return (
              <motion.article
                key={card.id}
                initial={{ opacity: 0, y: 36, scale: 0.97 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.55, delay: 0.15 + i * 0.1, ease: EASE }}
                className={`flex flex-col rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${card.colorBorder}`}
              >
                <div className={`relative flex items-center justify-center p-6 min-h-[200px] bg-gradient-to-b ${card.colorBg} to-transparent`}>
                  <Preview />
                </div>
                <div className="p-6 border-t border-gray-100">
                  <div className="mb-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold font-mono ${card.colorTag}`}>
                      / {card.number}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">{card.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{card.description}</p>
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── How It Works ─────────────────────────────────────────────────────────────

const HOW_STEPS = [
  { number: '01', title: 'Creá tu proyecto', description: 'Registrá el proyecto y definí sus módulos funcionales para organizar el trabajo.', Preview: StepFormMock },
  { number: '02', title: 'Documentá requisitos', description: 'Escribí historias de usuario con criterios de aceptación claros y verificables.', Preview: StepStoryMock },
  { number: '03', title: 'Vinculá las pruebas', description: 'Creá casos de prueba en Gherkin y revisá la cobertura completa en la matriz.', Preview: StepMatrixMini },
]

function HowItWorksSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-28 border-b border-gray-100 bg-gray-50" id="como-funciona">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-16"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-xs font-semibold text-teal-700 font-mono tracking-wider">
            CÓMO FUNCIONA
          </div>
          <h2 className="text-[2.6rem] font-extrabold tracking-tight text-gray-900 leading-tight max-w-2xl">
            Tres pasos para tener tu QA organizada desde el primer día.
          </h2>
        </motion.div>

        <div className="relative grid gap-10 sm:grid-cols-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="absolute top-7 left-[calc(33.33%+14px)] right-[calc(33.33%+14px)] h-px border-t-2 border-dashed border-gray-300 hidden sm:block"
          />

          {HOW_STEPS.map(({ number, title, description, Preview }, i) => (
            <div key={number} className="relative">
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : {}}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: i * 0.14 + 0.1 }}
                className="relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-white text-base font-bold shadow-lg shadow-teal-200 ring-8 ring-gray-50"
              >
                {number}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -24 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.14, ease: EASE }}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-5">{description}</p>
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm min-h-[130px]">
                  <Preview />
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── The Rule ─────────────────────────────────────────────────────────────────

const RULE_ITEMS = [
  { title: 'No hay "Done" sin verde', body: 'La regla la aplica el sistema, no el equipo.' },
  { title: 'Estados sincronizados', body: 'La salud de los tests se refleja en la historia.' },
  { title: 'Auditoría inmediata', body: 'Cada cambio queda registrado por autor y fecha.' },
]

function TheRuleSection() {
  return (
    <section className="py-28 border-b border-gray-100 bg-white" id="trazabilidad">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-16 lg:grid-cols-2 items-center">

          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-xs font-semibold text-teal-700 font-mono tracking-wider">
              LA REGLA
            </div>
            <h2 className="text-[2.6rem] font-extrabold tracking-tight text-gray-900 leading-tight mb-6">
              Trazabilidad{' '}
              <span className="bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent">
                garantizada.
              </span>
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed mb-8">
              RQA-Tracer aplica una regla clave:{' '}
              <strong className="text-gray-900">
                una historia de usuario no puede marcarse como &quot;Completada&quot; hasta tener al menos un caso de prueba aprobado.
              </strong>{' '}
              Así verificás que cada funcionalidad entregada fue probada.
            </p>

            <div className="space-y-4">
              {RULE_ITEMS.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100">
                    <CheckCircle2 className="h-3 w-3 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-mono text-gray-400">US-208</span>
              <span className="rounded-full bg-red-50 border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600">Bloqueado</span>
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-4">Calcular impuestos por región</h4>

            <div className="flex items-center gap-2 flex-wrap mb-4">
              {['Pendiente', 'En progreso'].map((s) => (
                <span key={s} className="rounded-full bg-gray-100 border border-gray-200 px-3 py-1 text-xs text-gray-600 font-medium">{s}</span>
              ))}
              <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span className="rounded-full bg-gray-100 border border-gray-200 px-3 py-1 text-xs text-gray-400 font-medium line-through opacity-50">Completada</span>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 mb-5">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                <strong>No se puede completar:</strong> 0 / 1 casos de prueba aprobados requeridos.
              </p>
            </div>

            <p className="text-[11px] text-gray-400 font-mono uppercase tracking-wider mb-2">Casos vinculados (1)</p>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 border-l-4 border-l-amber-400 px-4 py-3 bg-white shadow-sm mb-4">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-gray-400">TC-208.1</span>
                <span className="text-sm text-gray-700">Cálculo de IVA España</span>
              </div>
              <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-700">Sin ejecutar</span>
            </div>

            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-2.5">
              <p className="text-[11px] text-gray-500 font-mono">
                <span className="text-teal-600">→</span>{' '}
                Ejecutá TC-208.1 con resultado <strong>Aprobado</strong> para desbloquear.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── Final CTA ────────────────────────────────────────────────────────────────

function FinalCTASection() {
  return (
    <section className="py-28 bg-gray-50 border-b border-gray-100">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-xs font-semibold text-teal-700">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
            Listo para usar en segundos
          </div>
          <h2 className="text-[3rem] sm:text-[3.5rem] font-extrabold tracking-tight text-gray-900 leading-tight mb-4">
            Empezá a documentar hoy.
          </h2>
          <p className="text-lg text-gray-500 leading-relaxed mb-2">
            Gratis, sin instalación, sin base de datos.
          </p>
          <p className="text-sm text-gray-400 mb-10">Tu primer proyecto listo en menos de 4 minutos.</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Button size="lg" className="h-12 px-8 text-base bg-teal-600 text-white hover:bg-teal-700 font-semibold shadow-md shadow-teal-100" asChild>
              <Link href="/register">
                Comenzar gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="ghost" className="h-12 px-8 text-base text-gray-600 hover:text-gray-900 hover:bg-gray-100" asChild>
              <Link href="/login" className="flex items-center gap-1">
                Ya tengo cuenta
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            {VALUE_PROPS.map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal-500 shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-gray-100 py-8 bg-white">
      <div className="mx-auto max-w-7xl px-6 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-teal-600">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M4 14L9 4l3 6 4-2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="16" cy="8" r="1.4" fill="#fff" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-700">RQA<span className="text-teal-600">·</span>Tracer</span>
        </Link>
        <span className="text-xs text-gray-400 font-mono">Proyecto académico · v1.0 · 2026</span>
        <div className="flex gap-5 text-sm text-gray-400">
          <Link href="/login" className="hover:text-gray-600 transition-colors">Iniciar sesión</Link>
          <Link href="/register" className="hover:text-gray-600 transition-colors">Registrarse</Link>
        </div>
      </div>
    </footer>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ToolsSection />
        <HowItWorksSection />
        <TheRuleSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  )
}
