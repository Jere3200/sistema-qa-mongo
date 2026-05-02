'use client'

import { useRef } from 'react'
import Link from 'next/link'
import {
  TestTube2,
  FolderKanban,
  BookOpen,
  GitCompare,
  ArrowRight,
  CheckCircle2,
  Shield,
  Layers,
  Zap,
  ChevronRight,
} from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// ─── Datos ────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: FolderKanban,
    title: 'Gestión de Proyectos',
    description: 'Organizá tu trabajo en proyectos y módulos. Seguí el estado de cada entregable en tiempo real.',
    accent: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'group-hover:border-blue-200',
  },
  {
    icon: BookOpen,
    title: 'Historias de Usuario',
    description: 'Documentá requisitos en formato estándar con criterios de aceptación verificables y trazables.',
    accent: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'group-hover:border-purple-200',
  },
  {
    icon: TestTube2,
    title: 'Casos de Prueba',
    description: 'Escenarios Gherkin (Dado/Cuando/Entonces) vinculados directamente a cada historia de usuario.',
    accent: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'group-hover:border-teal-200',
  },
  {
    icon: GitCompare,
    title: 'Matriz de Trazabilidad',
    description: 'Visualizá la cobertura completa. Asegurate de que ningún requisito quede sin su prueba.',
    accent: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'group-hover:border-emerald-200',
  },
]

const steps = [
  {
    number: '01',
    title: 'Creá tu proyecto',
    description: 'Registrá el proyecto y definí sus módulos funcionales para organizar el trabajo.',
  },
  {
    number: '02',
    title: 'Documentá requisitos',
    description: 'Escribí historias de usuario con criterios de aceptación claros y verificables.',
  },
  {
    number: '03',
    title: 'Vinculá las pruebas',
    description: 'Creá casos de prueba y revisá la cobertura completa en la matriz de trazabilidad.',
  },
]

const valueProps = ['Sin instalación', 'Sin base de datos', '100% en el navegador', 'Gratis']

// ─── Mockup del app ───────────────────────────────────────────────────────────

function AppMockup() {
  const sidebarItems = ['Dashboard', 'Proyectos', 'Historias', 'Casos de Prueba', 'Trazabilidad']

  const stats = [
    { num: '12', label: 'Proyectos', accent: 'bg-blue-500' },
    { num: '48', label: 'Historias', accent: 'bg-purple-500' },
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
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-yellow-400" />
        <span className="h-3 w-3 rounded-full bg-green-400" />
        <div className="flex-1 mx-3 rounded-md bg-white border border-gray-200 h-5 flex items-center px-2">
          <span className="text-[10px] text-gray-400 font-mono">rqa-tracer.app/dashboard</span>
        </div>
      </div>

      {/* App layout */}
      <div className="flex" style={{ height: 300 }}>
        {/* Sidebar */}
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

        {/* Main content */}
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

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {stats.map((s) => (
              <div key={s.label} className="bg-white border border-gray-100 rounded-lg p-2 shadow-sm">
                <div className={`h-0.5 w-6 rounded-full ${s.accent} mb-1.5`} />
                <div className="text-xs font-bold text-gray-800">{s.num}</div>
                <div className="text-[9px] text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="space-y-1.5">
            {rows.map((row) => (
              <div key={row.code} className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-1.5 shadow-sm">
                <span className="text-[9px] font-mono text-gray-400 shrink-0 w-10">{row.code}</span>
                <span className="text-[10px] text-gray-700 flex-1 truncate">{row.title}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${row.cls}`}>
                  {row.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sección de features con scroll animation ─────────────────────────────────

function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl tracking-tight">
            Todo lo que necesitás
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto leading-relaxed">
            Cuatro herramientas integradas para cubrir el ciclo completo de requisitos y pruebas.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className={`group rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 ${f.border}`}
            >
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${f.bg} ${f.accent}`}>
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900 text-sm leading-tight">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Sección de pasos ─────────────────────────────────────────────────────────

function StepsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-24 bg-white border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl tracking-tight">
            Cómo funciona
          </h2>
          <p className="mt-4 text-gray-500 max-w-md mx-auto leading-relaxed">
            Tres pasos para tener tu documentación QA organizada y trazable desde el primer día.
          </p>
        </motion.div>

        <div className="relative grid gap-10 sm:grid-cols-3">
          {/* Connecting line */}
          <div className="absolute top-6 left-[calc(16.67%+28px)] right-[calc(16.67%+28px)] hidden h-px bg-gray-200 sm:block" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="relative z-10 mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-teal-500 text-white text-sm font-bold shadow-lg shadow-teal-200">
                {step.number}
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-teal-600 text-white shadow-sm">
              <TestTube2 className="size-4" />
            </div>
            <span className="font-bold text-gray-900">RQA-Tracer</span>
          </Link>

          <nav className="flex items-center gap-2">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900" asChild>
              <Link href="/login">Iniciar sesión</Link>
            </Button>
            <Button className="bg-teal-600 text-white hover:bg-teal-700 shadow-sm font-semibold" asChild>
              <Link href="/register">
                Comenzar gratis
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-white">
          {/* Fondo suave */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50/60 via-white to-blue-50/40 pointer-events-none" />
          <div
            className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
            style={{
              background: 'radial-gradient(circle at top right, rgba(20,184,166,0.08) 0%, transparent 70%)',
            }}
          />

          <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-28">
            <div className="grid items-center gap-12 lg:grid-cols-2">

              {/* Texto */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Badge className="mb-6 border-gray-200 bg-gray-100 text-gray-600 gap-1.5">
                    <Shield className="h-3 w-3 text-teal-600" />
                    Proyecto académico · Datos locales · Sin backend
                  </Badge>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.05 }}
                  className="text-4xl font-bold tracking-tight text-gray-900 text-balance leading-[1.15] sm:text-5xl lg:text-[3.25rem]"
                >
                  Trazabilidad de{' '}
                  <span className="bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent">
                    Requisitos y QA
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.1 }}
                  className="mt-5 text-lg text-gray-500 leading-relaxed text-balance max-w-lg"
                >
                  Documentá historias de usuario, casos de prueba y su trazabilidad completa
                  en un solo lugar. Garantizá que cada requisito tiene su prueba.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.15 }}
                  className="mt-8 flex flex-col gap-3 sm:flex-row"
                >
                  <Button
                    size="lg"
                    className="h-12 px-7 text-base bg-teal-600 text-white hover:bg-teal-700 font-semibold shadow-md shadow-teal-100"
                    asChild
                  >
                    <Link href="/register">
                      Comenzar gratis
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-7 text-base border-gray-200 text-gray-700 hover:bg-gray-50"
                    asChild
                  >
                    <Link href="/login">Ya tengo cuenta</Link>
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.25 }}
                  className="mt-8 flex flex-wrap gap-5 text-sm text-gray-500"
                >
                  {valueProps.map((item) => (
                    <span key={item} className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-teal-500 shrink-0" />
                      {item}
                    </span>
                  ))}
                </motion.div>
              </div>

              {/* Mockup */}
              <div className="relative hidden lg:block">
                {/* Badge flotante superior */}
                <motion.div
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="absolute -top-5 -right-4 z-20"
                >
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-lg"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-800">94% de cobertura</p>
                      <p className="text-[10px] text-gray-400">Todas las historias cubiertas</p>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Badge flotante inferior */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.65 }}
                  className="absolute -bottom-5 -left-4 z-20"
                >
                  <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                    className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-lg"
                  >
                    <div className="h-7 w-7 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                      <Zap className="h-3.5 w-3.5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">Prueba aprobada</p>
                      <p className="text-[10px] text-gray-400">TC-042 · Login de usuario</p>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Mockup principal */}
                <motion.div
                  initial={{ opacity: 0, x: 40, rotateY: -4 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0 }}
                  transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{ perspective: 1200 }}
                >
                  <AppMockup />
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features (lazy) ── */}
        <FeaturesSection />

        {/* ── Steps (lazy) ── */}
        <StepsSection />

        {/* ── Business rule ── */}
        <section className="py-16 bg-gray-50 border-t border-gray-100">
          <div className="mx-auto max-w-3xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <Layers className="h-6 w-6 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Trazabilidad garantizada</h2>
              <p className="text-gray-600 leading-relaxed text-sm max-w-xl mx-auto">
                RQA-Tracer aplica una regla clave:{' '}
                <span className="text-gray-900 font-semibold">
                  una historia de usuario no puede marcarse como "Completada" hasta tener al menos
                  un caso de prueba aprobado.
                </span>{' '}
                Así verificás que cada funcionalidad entregada fue probada.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 bg-white border-t border-gray-100">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 text-sm text-teal-700 font-medium bg-teal-50 border border-teal-100 rounded-full px-4 py-1.5 mb-6">
                <Zap className="h-3.5 w-3.5" />
                Listo para usar en segundos
              </div>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl tracking-tight">
                Empezá a documentar hoy
              </h2>
              <p className="mt-4 text-gray-500 text-lg leading-relaxed">
                Gratis, sin instalación, sin base de datos.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button
                  size="lg"
                  className="h-12 px-8 bg-teal-600 text-white hover:bg-teal-700 font-semibold shadow-md shadow-teal-100"
                  asChild
                >
                  <Link href="/register">
                    Crear cuenta gratis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="h-12 px-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  asChild
                >
                  <Link href="/login" className="flex items-center gap-1">
                    Ya tengo cuenta
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-8 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 flex flex-col items-center gap-2 text-center text-sm text-gray-400 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-5 items-center justify-center rounded bg-teal-600 text-white">
              <TestTube2 className="size-3" />
            </div>
            <span className="font-medium text-gray-600">RQA-Tracer</span>
          </div>
          <span>© {new Date().getFullYear()} · Sistema de Trazabilidad de Requisitos y QA</span>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-gray-600 transition-colors">Iniciar sesión</Link>
            <Link href="/register" className="hover:text-gray-600 transition-colors">Registrarse</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
