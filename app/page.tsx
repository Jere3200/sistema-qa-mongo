'use client'

import { useRef, Fragment, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AlertTriangle, ArrowRight, ChevronDown } from 'lucide-react'
import { motion, useInView, useReducedMotion, useScroll, useSpring, animate } from 'framer-motion'
import { Button } from '@/components/ui/button'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]
const SPRING = { type: 'spring' as const, stiffness: 380, damping: 26 }
const VALUE_PROPS = ['Sin instalación', '100% en el navegador', 'Gratis']

// ─── Background patterns ───────────────────────────────────────────────────────

function GridLines({ fade = 'top' }: { fade?: 'top' | 'center' }) {
  const mask =
    fade === 'center'
      ? 'radial-gradient(ellipse 80% 80% at 50% 50%, #000 30%, transparent 80%)'
      : 'radial-gradient(ellipse 90% 70% at 50% 0%, #000 35%, transparent 78%)'
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        backgroundImage:
          'linear-gradient(to right, rgba(15,23,42,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.045) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    />
  )
}

function GlowAccent({ className, color = 'rgba(20,184,166,0.12)' }: { className: string; color?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute z-0 rounded-full blur-3xl ${className}`}
      style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }}
    />
  )
}

// ─── Matrix helpers ────────────────────────────────────────────────────────────

function getBigCell(r: number, c: number): 'pass' | 'warn' | 'fail' | 'empty' {
  const v = (r * 7 + c * 3 + 1) % 5
  if (v === 4) return 'empty'
  if (v === 3) return 'fail'
  if (v === 2) return 'warn'
  return 'pass'
}

function getMiniCell(r: number, c: number): 'pass' | 'warn' | 'empty' {
  const v = (r * 5 + c * 3) % 4
  if (v === 3) return 'empty'
  if (v === 2) return 'warn'
  return 'pass'
}

// Cells stagger in when the grid enters the viewport
function BigMatrix() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <div ref={ref} className="w-full">
      <div className="grid gap-1" style={{ gridTemplateColumns: '50px repeat(8, 1fr)' }}>
        <div />
        {Array.from({ length: 8 }, (_, c) => (
          <div key={c} className="text-center font-mono text-[9px] text-gray-400">T{c + 1}</div>
        ))}
        {Array.from({ length: 5 }, (_, r) => (
          <Fragment key={r}>
            <div className="self-center font-mono text-[10px] text-gray-400">US-{r + 1}</div>
            {Array.from({ length: 8 }, (_, c) => {
              const s = getBigCell(r, c)
              return (
                <motion.div
                  key={c}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ ...SPRING, delay: 0.1 + (r * 8 + c) * 0.018 }}
                  className={`h-[18px] rounded-[3px] ${
                    s === 'pass' ? 'bg-teal-500' :
                    s === 'warn' ? 'bg-amber-400' :
                    s === 'fail' ? 'bg-red-500' :
                    'border border-dashed border-gray-300'
                  }`}
                />
              )
            })}
          </Fragment>
        ))}
      </div>
    </div>
  )
}

function MiniMatrix() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <div ref={ref} className="grid gap-[3px]" style={{ gridTemplateColumns: '40px repeat(6, 1fr)' }}>
      <div />
      {Array.from({ length: 6 }, (_, c) => (
        <div key={c} className="text-center font-mono text-[8px] text-gray-400">T{c + 1}</div>
      ))}
      {Array.from({ length: 4 }, (_, r) => (
        <Fragment key={r}>
          <div className="self-center font-mono text-[9px] text-gray-400">US-{r + 1}</div>
          {Array.from({ length: 6 }, (_, c) => {
            const s = getMiniCell(r, c)
            return (
              <motion.div
                key={c}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ ...SPRING, delay: 0.1 + (r * 6 + c) * 0.024 }}
                className={`h-[14px] rounded-[2px] ${
                  s === 'pass' ? 'bg-teal-500' :
                  s === 'warn' ? 'bg-amber-400' :
                  'border border-dashed border-gray-300'
                }`}
              />
            )
          })}
        </Fragment>
      ))}
    </div>
  )
}

// ─── Animated stat counter ─────────────────────────────────────────────────────

function AnimatedStat({ num, suffix, label, color }: { num: number; suffix: string; label: string; color: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, num, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setCount(Math.round(v)),
    })
    return controls.stop
  }, [inView, num])

  return (
    <div ref={ref} className="relative overflow-hidden rounded-lg border border-gray-100 p-3">
      <div className="absolute left-0 right-0 top-0 h-0.5" style={{ background: color }} />
      <div className="text-[22px] font-semibold tracking-[-0.5px] text-gray-900">
        {count}{suffix}
      </div>
      <div className="mt-0.5 text-[11.5px] text-gray-400">{label}</div>
    </div>
  )
}

// ─── Scroll progress ─────────────────────────────────────────────────────────

function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 })
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-teal-500 to-teal-400"
    />
  )
}

// ─── Navbar ────────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-lg transition-all duration-300 ${
        scrolled ? 'border-gray-200 bg-white/90 shadow-[0_1px_12px_-4px_rgba(13,31,26,0.12)]' : 'border-transparent bg-white/70'
      }`}
    >
      <div className="mx-auto flex h-[56px] max-w-[1240px] items-center gap-9 px-8">
        <Link href="/" className="flex shrink-0 items-center" aria-label="RQA-Tracer">
          <Image src="/logo.png" alt="RQA·Tracer" width={120} height={120} priority className="h-10 w-auto" />
        </Link>

        <nav className="ml-3 hidden items-center gap-6 md:flex">
          {[
            { label: 'Producto', href: '#producto' },
            { label: 'Trazabilidad', href: '#trazabilidad' },
            { label: 'Cómo funciona', href: '#como-funciona' },
          ].map((link, i) => (
            <motion.a
              key={link.label}
              href={link.href}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.05, ease: EASE, duration: 0.4 }}
              className="text-[13.5px] font-[450] text-gray-600 transition-colors hover:text-gray-900"
            >
              {link.label}
            </motion.a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <Button variant="ghost" className="hidden text-[13.5px] text-gray-600 hover:text-gray-900 sm:flex" asChild>
              <Link href="/login">Iniciar sesión</Link>
            </Button>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35, ...SPRING }}>
            <Button className="gap-2 bg-teal-600 text-sm font-medium text-white shadow-sm hover:bg-teal-700" asChild>
              <Link href="/register">
                Comenzar gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </header>
  )
}

// ─── Hero ──────────────────────────────────────────────────────────────────────

function HeroSection() {
  const shouldReduce = useReducedMotion()
  return (
    <section className="relative overflow-hidden border-b border-gray-200 px-8 pb-16 pt-20">

      {/* Dot grid for depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(13,148,136,0.12) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          maskImage: 'radial-gradient(ellipse 75% 55% at 50% 0%, #000 25%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 55% at 50% 0%, #000 25%, transparent 75%)',
        }}
      />

      {/* Pulsing gradient background */}
      <motion.div
        animate={shouldReduce ? {} : { scale: [1, 1.06, 1], opacity: [0.45, 0.65, 0.45] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[600px]"
        style={{ background: 'radial-gradient(circle at 50% 0%, rgba(20,184,166,0.13) 0%, transparent 60%)' }}
      />

      <div className="relative z-10 mx-auto max-w-[1240px]">

        {/* Pill */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-7"
        >
          <span className="inline-flex items-center gap-1.5 rounded border border-teal-200 bg-teal-50 px-3 py-1 text-[11px] font-medium text-teal-700">
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-[5px] w-[5px] rounded-full bg-teal-500"
            />
            Proyecto académico - jeremías fernandez.
          </span>
        </motion.div>

        {/* H1 — two lines animate from opposite sides */}
        <h1 className="max-w-[1100px] text-[52px] font-semibold leading-[.98] tracking-[-1.8px] text-gray-900 sm:text-[68px] lg:text-[84px] lg:tracking-[-2.6px]">
          <motion.span
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.06, ease: EASE }}
            className="block"
          >
            Trazabilidad de <span className="text-teal-600">Requisitos</span>
          </motion.span>
          <motion.span
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.14, ease: EASE }}
            className="block"
          >
            y <span className="text-teal-600">QA</span>, en un solo lugar.
          </motion.span>
        </h1>

        {/* Lead — blur fade */}
        <motion.p
          initial={{ opacity: 0, filter: 'blur(8px)', y: 12 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{ duration: 0.65, delay: 0.22, ease: EASE }}
          className="mt-7 max-w-[640px] text-[19px] font-normal leading-[1.55] text-gray-600"
        >
          Documentá <strong className="font-semibold text-gray-900">historias de usuario</strong>,{' '}
          <strong className="font-semibold text-gray-900">casos de prueba</strong> en Gherkin y la
          trazabilidad completa entre ambos. Garantizá que cada requisito tenga su prueba.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
          className="mt-9 flex flex-wrap items-center gap-2.5"
        >
          {/* Primary with pulse ring */}
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0, 0.35] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
              className="absolute inset-0 rounded-lg bg-teal-500/40 blur-sm"
            />
            <Button
              size="lg"
              className="relative h-12 gap-2 bg-teal-600 px-[22px] text-[14.5px] font-medium text-white shadow-lg shadow-teal-200/60 hover:bg-teal-700"
              asChild
            >
              <Link href="/register">
                Comenzar gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <Button
            size="lg"
            variant="outline"
            className="h-12 border-gray-300 px-[22px] text-[14.5px] font-medium text-gray-800 hover:bg-gray-50"
            asChild
          >
            <Link href="/login">Ya tengo cuenta</Link>
          </Button>
        </motion.div>

        {/* Bullets */}
        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-7 flex flex-wrap gap-7"
          role="list"
        >
          {VALUE_PROPS.map((item, i) => (
            <motion.li
              key={item}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ x: 3, transition: SPRING }}
              transition={{ delay: 0.42 + i * 0.06, ease: EASE, duration: 0.4 }}
              className="flex items-center gap-2 text-[13.5px] text-gray-600"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true" className="shrink-0">
                <circle cx="10" cy="10" r="9" fill="#e2f5ee" stroke="#0e9b78" strokeWidth="1" />
                <path d="M6 10.5l2.5 2.5L14 7.5" stroke="#0e9b78" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {item}
            </motion.li>
          ))}
        </motion.ul>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-10 flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="h-5 w-5 text-gray-300" />
          </motion.div>
        </motion.div>

        {/* Full-width browser preview */}
        <div className="relative mt-8 pb-12 pt-2">

          {/* Floating card: coverage (top-right) */}
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.55, ...SPRING }}
            className="absolute right-8 top-0 z-20 hidden md:block"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ scale: 1.04 }}
              className="flex cursor-default items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-[0_12px_30px_-12px_rgba(13,31,26,0.18),0_4px_8px_-4px_rgba(13,31,26,0.06)]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M5 10.5l3 3L15 7" stroke="#0e9b78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">94% de cobertura</div>
                <div className="text-[11.5px] text-gray-400">Todas las historias cubiertas</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Browser window */}
          <motion.div
            initial={{ opacity: 0, y: 32, rotateX: 4 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.8, delay: 0.38, ease: EASE }}
            style={{ perspective: 1200 }}
            className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_1px_0_rgba(0,0,0,.02),0_24px_60px_-28px_rgba(13,31,26,.18),0_8px_16px_-8px_rgba(13,31,26,.06)]"
          >
            {/* Chrome bar */}
            <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-[14px] py-[10px]">
              <span className="h-[11px] w-[11px] rounded-full bg-red-400" />
              <span className="h-[11px] w-[11px] rounded-full bg-yellow-400" />
              <span className="h-[11px] w-[11px] rounded-full bg-green-400" />
              <div className="ml-4 rounded-md border border-gray-200 bg-white px-3 py-1 font-mono text-xs text-gray-400">
                rqa-tracer.app/dashboard
              </div>
            </div>
            {/* Body */}
            <div className="flex min-h-[480px]">
              {/* Sidebar */}
              <aside className="hidden w-[220px] shrink-0 flex-col bg-gray-900 p-[14px] md:flex">
                <div className="mb-[22px] flex items-center gap-2 px-1.5">
                  <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-md bg-teal-600">
                    <span className="font-mono text-[10px] font-bold text-white">QA</span>
                  </div>
                  <span className="text-sm font-semibold text-white">RQA-Tracer</span>
                </div>
                <nav className="flex flex-col gap-0.5 text-[13px]">
                  {['Dashboard', 'Proyectos', 'Historias', 'Casos de Prueba', 'Trazabilidad'].map((item, i) => (
                    <div
                      key={item}
                      className={`flex items-center gap-2 rounded-md px-3 py-2 ${
                        i === 0 ? 'bg-teal-600 font-medium text-white' : 'text-gray-400'
                      }`}
                    >
                      <span className={`h-[5px] w-[5px] shrink-0 rounded-full ${i === 0 ? 'bg-white' : 'bg-gray-600'}`} />
                      {item}
                    </div>
                  ))}
                </nav>
              </aside>
              {/* Dashboard */}
              <main className="flex-1 bg-white p-6">
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold tracking-[-0.3px] text-gray-900">Dashboard</h3>
                    <p className="mt-0.5 text-[12.5px] text-gray-400">Resumen del proyecto</p>
                  </div>
                  <div className="flex h-8 items-center rounded-lg bg-teal-600 px-3 text-[13px] font-medium text-white">
                    + Nuevo proyecto
                  </div>
                </div>
                {/* Stats with count-up */}
                <div className="mb-5 grid grid-cols-4 gap-2.5">
                  <AnimatedStat num={12}  suffix=""  label="Proyectos" color="#2563eb" />
                  <AnimatedStat num={48}  suffix=""  label="Historias"  color="#7c3aed" />
                  <AnimatedStat num={127} suffix=""  label="Pruebas"    color="#0e9b78" />
                  <AnimatedStat num={94}  suffix="%" label="Cobertura"  color="#0e9b78" />
                </div>
                <div className="flex flex-col gap-1.5">
                  {[
                    { code: 'US-001', title: 'Login de usuario',        badge: 'Completado', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                    { code: 'US-002', title: 'Gestión de proyectos',    badge: 'En Pruebas',  cls: 'bg-purple-50 text-purple-700 border-purple-200' },
                    { code: 'US-003', title: 'Matriz de trazabilidad',  badge: 'En Progreso', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
                    { code: 'US-004', title: 'Casos de prueba Gherkin', badge: 'Pendiente',   cls: 'bg-amber-50 text-amber-700 border-amber-200' },
                  ].map((row) => (
                    <div key={row.code} className="flex items-center gap-3.5 rounded-lg border border-gray-100 px-3.5 py-2.5">
                      <span className="w-12 shrink-0 font-mono text-[11px] text-gray-400">{row.code}</span>
                      <span className="flex-1 text-[13.5px] font-[450] text-gray-900">{row.title}</span>
                      <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium ${row.cls}`}>
                        {row.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </main>
            </div>
          </motion.div>

          {/* Floating card: approved (bottom-left) */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.72, ...SPRING }}
            className="absolute bottom-0 left-16 z-20 hidden md:block"
          >
            <motion.div
              animate={{ y: [0, 7, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
              whileHover={{ scale: 1.04 }}
              className="flex cursor-default items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-[0_12px_30px_-12px_rgba(13,31,26,0.18),0_4px_8px_-4px_rgba(13,31,26,0.06)]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M11 2L4 11h5l-2 7 7-9h-5l2-7z" fill="#0e9b78" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Prueba aprobada</div>
                <div className="font-mono text-[11.5px] text-gray-400">TC-042 · Login de usuario</div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

// ─── Metrics band ──────────────────────────────────────────────────────────────

function BandStat({ value, suffix, label, delay }: { value: number; suffix: string; label: string; delay: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, value, {
      duration: 1.2,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setCount(Math.round(v)),
    })
    return controls.stop
  }, [inView, value, delay])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      className="text-center"
    >
      <div className="text-[40px] font-semibold tracking-[-1.5px] tabular-nums text-gray-900 sm:text-[52px]">
        {count}
        <span className="text-teal-600">{suffix}</span>
      </div>
      <div className="mt-1 text-[13px] leading-snug text-gray-500">{label}</div>
    </motion.div>
  )
}

const BAND_METRICS = [
  { value: 100, suffix: '%', label: 'Cobertura exigida para completar' },
  { value: 4, suffix: '', label: 'Herramientas integradas' },
  { value: 3, suffix: '', label: 'Pasos del flujo QA' },
  { value: 0, suffix: '', label: 'Requisitos sin su prueba' },
]

function MetricsBand() {
  return (
    <section className="relative overflow-hidden border-b border-gray-200 bg-white px-8 py-16">
      <GridLines fade="center" />
      <div className="relative z-10 mx-auto grid max-w-[1240px] grid-cols-2 gap-y-10 sm:grid-cols-4">
        {BAND_METRICS.map((m, i) => (
          <BandStat key={m.label} value={m.value} suffix={m.suffix} label={m.label} delay={i * 0.08} />
        ))}
      </div>
    </section>
  )
}

// ─── Tool card previews ────────────────────────────────────────────────────────

function ProjectsMock() {
  const projects = [
    { name: 'Sistema de E-commerce', meta: '8 módulos', pct: 75, bar: 'bg-teal-600', txt: 'text-teal-600' },
    { name: 'Banca Digital v2',      meta: '12 módulos', pct: 42, bar: 'bg-blue-600', txt: 'text-blue-600' },
    { name: 'Plataforma educativa',  meta: '6 módulos',  pct: 91, bar: 'bg-violet-600', txt: 'text-violet-600' },
  ]
  return (
    <div className="w-full space-y-2">
      {projects.map((p) => (
        <div key={p.name} className="rounded-lg border border-gray-100 bg-white px-3.5 py-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[13.5px] font-medium text-gray-900">{p.name}</span>
            <span className="font-mono text-[11px] text-gray-400">{p.meta}</span>
          </div>
          <div className="h-[5px] overflow-hidden rounded-full bg-gray-100">
            <div className={`h-full rounded-full ${p.bar}`} style={{ width: `${p.pct}%` }} />
          </div>
          <div className={`mt-1.5 font-mono text-[11px] ${p.txt}`}>{p.pct}% completado</div>
        </div>
      ))}
    </div>
  )
}

function StoriesMock() {
  return (
    <div className="w-full rounded-lg border border-gray-100 bg-white p-3.5">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="font-mono text-[11px] text-gray-400">US-118</span>
        <span className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">In review</span>
      </div>
      <div className="mb-2.5 text-sm font-medium text-gray-900">Recuperación de contraseña</div>
      <div className="rounded-md border border-gray-100 bg-gray-50 px-2.5 py-2 text-[12.5px] leading-relaxed text-gray-600">
        <strong className="text-gray-900">Como</strong> usuario registrado{' '}
        <strong className="text-gray-900">quiero</strong> recuperar mi contraseña por email{' '}
        <strong className="text-gray-900">para</strong> volver a entrar sin contactar soporte.
      </div>
      <div className="mt-2.5 flex gap-3 font-mono text-[11px] text-gray-400">
        <span>3 criterios</span><span>·</span><span>Módulo: Auth</span>
      </div>
    </div>
  )
}

function TestCasesMock() {
  return (
    <div className="w-full rounded-lg bg-gray-900 px-4 py-3.5 font-mono">
      <div className="mb-1.5 text-[10px] uppercase tracking-[0.5px] text-gray-500">
        TC-042 · vinculado a US-001
      </div>
      <div className="space-y-0.5 text-[12px] leading-[1.85]">
        <div><span className="text-violet-400">Característica:</span><span className="text-white"> Login de usuario</span></div>
        <div><span className="text-yellow-300">Escenario:</span><span className="text-white"> Login válido</span></div>
        <div><span className="text-green-400">&nbsp;&nbsp;Dado</span><span className="text-gray-400"> que el usuario está en /login</span></div>
        <div><span className="text-green-400">&nbsp;&nbsp;Cuando</span><span className="text-gray-400"> ingresa credenciales correctas</span></div>
        <div><span className="text-green-400">&nbsp;&nbsp;Entonces</span><span className="text-gray-400"> es redirigido al dashboard</span></div>
      </div>
    </div>
  )
}

function MatrixMock() {
  return (
    <div className="w-full rounded-lg border border-gray-100 bg-white p-3.5">
      <div className="mb-2.5 flex items-center justify-between font-mono text-[11px] text-gray-400">
        <span>Stories ↓ / Tests →</span>
        <span className="font-semibold text-teal-600">↑ 87% cubierto</span>
      </div>
      <BigMatrix />
    </div>
  )
}

const TOOLS = [
  { id: 'projects', number: '01', title: 'Gestión de Proyectos',    description: 'Organizá tu trabajo en proyectos y módulos. Seguí el estado de cada entregable en tiempo real.',                   tag: 'text-blue-600 bg-blue-50',   bg: 'from-blue-50/30',   Mock: ProjectsMock },
  { id: 'stories',  number: '02', title: 'Historias de Usuario',    description: 'Documentá requisitos en formato estándar con criterios de aceptación verificables y trazables.',                    tag: 'text-violet-600 bg-violet-50', bg: 'from-violet-50/30', Mock: StoriesMock  },
  { id: 'tests',    number: '03', title: 'Casos de Prueba',         description: 'Escenarios Gherkin (Dado / Cuando / Entonces) vinculados directamente a cada historia de usuario.',                tag: 'text-teal-600 bg-teal-50',   bg: 'from-teal-50/30',   Mock: TestCasesMock },
  { id: 'matrix',   number: '04', title: 'Matriz de Trazabilidad',  description: 'Visualizá la cobertura completa. Asegurate de que ningún requisito quede sin su prueba.',                          tag: 'text-amber-600 bg-amber-50',  bg: 'from-amber-50/30',  Mock: MatrixMock   },
]

function ToolsSection() {
  return (
    <section className="relative overflow-hidden border-b border-gray-200 bg-gray-50 px-8 py-[120px]" id="producto">
      <GridLines fade="center" />
      <GlowAccent className="left-1/2 top-[-120px] h-[420px] w-[620px] -translate-x-1/2" />
      <div className="relative z-10 mx-auto max-w-[1240px]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-16 max-w-[720px]"
        >
          <div className="mb-5 inline-flex items-center rounded border border-teal-200 bg-teal-50 px-3 py-1 font-mono text-[11px] font-semibold tracking-[0.4px] text-teal-700">
            PRODUCTO
          </div>
          <h2 className="mt-5 text-[52px] font-semibold leading-[1.05] tracking-[-1.6px] text-gray-900">
            Todo lo que necesitás.
          </h2>
          <p className="mt-[18px] text-[18px] leading-[1.55] text-gray-500">
            Cuatro herramientas integradas para cubrir el ciclo completo de requisitos y pruebas.
          </p>
        </motion.div>

        <div className="grid gap-3.5 sm:grid-cols-2">
          {TOOLS.map(({ id, number, title, description, tag, bg, Mock }, i) => (
            <motion.article
              key={id}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: EASE }}
              whileHover={{ y: -6, boxShadow: '0 20px 48px -16px rgba(13,31,26,0.16)', borderColor: '#cbd5d0', transition: { ...SPRING } }}
              className="grid cursor-pointer grid-rows-[1fr_auto] overflow-hidden rounded-2xl border border-gray-200 bg-white"
            >
              <div className={`flex min-h-[220px] items-center justify-center bg-gradient-to-b px-7 py-7 ${bg} to-transparent`}>
                <Mock />
              </div>
              <div className="border-t border-gray-100 px-7 py-6">
                <div className="mb-2.5">
                  <span className={`rounded px-2 py-0.5 font-mono text-[11px] font-bold tracking-[0.4px] ${tag}`}>/ {number}</span>
                </div>
                <h3 className="mb-2.5 text-[19px] font-semibold tracking-[-0.3px] text-gray-900">{title}</h3>
                <p className="text-[14.5px] leading-[1.55] text-gray-500">{description}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── How It Works ──────────────────────────────────────────────────────────────

function StepFormPanel() {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 12px 32px -12px rgba(13,31,26,0.14)', transition: SPRING }}
      className="rounded-xl border border-gray-200 bg-white p-3.5"
    >
      <div className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.5px] text-gray-400">Nuevo Proyecto</div>
      <div className="mb-1 text-[11px] text-gray-400">Nombre</div>
      <div className="mb-2.5 rounded-md border border-gray-200 px-2.5 py-2 text-[13px] text-gray-900">Sistema de E-commerce</div>
      <div className="mb-1 text-[11px] text-gray-400">Módulos</div>
      <div className="flex flex-wrap gap-1.5">
        {['Auth', 'Catálogo', 'Carrito', 'Pago'].map((m) => (
          <span key={m} className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] text-gray-600">{m}</span>
        ))}
        <span className="rounded border border-teal-200 bg-teal-50 px-2 py-0.5 text-[11px] text-teal-700">+ agregar</span>
      </div>
    </motion.div>
  )
}

function StepStoryPanel() {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 12px 32px -12px rgba(13,31,26,0.14)', transition: SPRING }}
      className="rounded-xl border border-gray-200 bg-white p-3.5"
    >
      <div className="mb-2.5 flex items-center justify-between">
        <span className="font-mono text-[11px] text-gray-400">US-001</span>
        <span className="rounded border border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">Historia</span>
      </div>
      <div className="mb-2.5 text-[13.5px] font-medium text-gray-900">Login de usuario</div>
      <div className="mb-2.5 rounded-md border border-gray-100 bg-gray-50 px-2.5 py-2 text-[12.5px] leading-relaxed text-gray-600">
        <strong className="text-gray-900">Como</strong> usuario{' '}
        <strong className="text-gray-900">quiero</strong> iniciar sesión{' '}
        <strong className="text-gray-900">para</strong> acceder a mi cuenta.
      </div>
      <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.5px] text-gray-400">Criterios de aceptación</div>
      {['Validar email y contraseña', 'Mostrar error si son incorrectos', 'Redirigir a dashboard'].map((c, i) => (
        <motion.div
          key={c}
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 + i * 0.08, ease: EASE, duration: 0.35 }}
          className="flex items-center gap-2 py-0.5 text-[12px] text-gray-600"
        >
          <span className="shrink-0 text-teal-600">✓</span>{c}
        </motion.div>
      ))}
    </motion.div>
  )
}

function StepMatrixPanel() {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 12px 32px -12px rgba(13,31,26,0.14)', transition: SPRING }}
      className="rounded-xl border border-gray-200 bg-white p-3.5"
    >
      <div className="mb-2.5 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.5px] text-gray-400">Matriz</span>
        <span className="rounded border border-teal-200 bg-teal-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-teal-700">87%</span>
      </div>
      <MiniMatrix />
    </motion.div>
  )
}

const STEPS = [
  { number: '01', title: 'Creá tu proyecto',    description: 'Registrá el proyecto y definí sus módulos funcionales para organizar el trabajo.',                        Panel: StepFormPanel   },
  { number: '02', title: 'Documentá requisitos', description: 'Escribí historias de usuario con criterios de aceptación claros y verificables.',                         Panel: StepStoryPanel  },
  { number: '03', title: 'Vinculá las pruebas',  description: 'Creá casos de prueba en Gherkin y revisá la cobertura completa en la matriz.',                            Panel: StepMatrixPanel },
]

function HowItWorksSection() {
  return (
    <section className="relative overflow-hidden border-b border-gray-200 bg-white px-8 py-[120px]" id="como-funciona">
      <GridLines fade="center" />
      <GlowAccent className="right-[-100px] top-[10%] h-[460px] w-[460px]" color="rgba(20,184,166,0.10)" />
      <div className="relative z-10 mx-auto max-w-[1240px]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-16 max-w-[720px]"
        >
          <div className="mb-5 inline-flex items-center rounded border border-teal-200 bg-teal-50 px-3 py-1 font-mono text-[11px] font-semibold tracking-[0.4px] text-teal-700">
            CÓMO FUNCIONA
          </div>
          <h2 className="mt-5 text-[52px] font-semibold leading-[1.05] tracking-[-1.6px] text-gray-900">
            Tres pasos para tener tu QA<br />organizada desde el primer día.
          </h2>
        </motion.div>

        <div className="relative grid gap-12 sm:gap-0 sm:grid-cols-3">
          {/* Dashed line */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
            style={{
              originX: 0,
              position: 'absolute',
              top: 28,
              left: 'calc(33.33% / 2 + 28px)',
              right: 'calc(33.33% / 2 + 28px)',
              height: '1px',
              background: 'repeating-linear-gradient(to right, #bfe5d6 0 6px, transparent 6px 12px)',
            }}
            className="hidden sm:block"
          />

          {STEPS.map(({ number, title, description, Panel }, i) => (
            <div key={number} className={`relative ${i !== STEPS.length - 1 ? 'sm:pr-7' : ''} ${i !== 0 ? 'sm:pl-7' : ''}`}>
              {/* Step circle */}
              <div className="relative mb-6">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ ...SPRING, delay: i * 0.15 + 0.2 }}
                  className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 border-teal-600 bg-white font-mono text-base font-semibold text-teal-600"
                  style={{ boxShadow: '0 0 0 8px #ffffff, 0 0 0 9px rgba(191,229,214,0.33)' }}
                >
                  {number}
                </motion.div>
                {/* Pulse ring that fades after appearing */}
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: [1, 1.6, 1.6], opacity: [0.6, 0, 0] }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.8, delay: i * 0.15 + 0.4 }}
                  className="absolute left-0 top-0 h-14 w-14 rounded-full border-2 border-teal-400"
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5, delay: i * 0.15 + 0.1, ease: EASE }}
              >
                <h3 className="mb-2 text-[22px] font-semibold tracking-[-0.5px] text-gray-900">{title}</h3>
                <p className="mb-5 max-w-[340px] text-[14.5px] leading-[1.55] text-gray-500">{description}</p>
                <Panel />
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── The Rule ──────────────────────────────────────────────────────────────────

const RULE_ITEMS = [
  { title: 'No hay "Done" sin verde',  body: 'La regla la aplica el sistema, no el equipo.' },
  { title: 'Estados sincronizados',    body: 'La salud de los tests se refleja en la historia.' },
  { title: 'Auditoría inmediata',      body: 'Cada cambio queda registrado por autor y fecha.' },
]

function TheRuleSection() {
  return (
    <section className="relative overflow-hidden border-b border-gray-200 bg-gray-50 px-8 py-[120px]" id="trazabilidad">
      <GridLines fade="center" />
      <GlowAccent className="bottom-[-120px] left-[-120px] h-[420px] w-[520px]" color="rgba(20,184,166,0.09)" />
      <div className="relative z-10 mx-auto max-w-[1240px]">
        <div className="grid items-center gap-[80px] lg:grid-cols-[1.1fr_1fr]">

          <motion.div
            initial={{ opacity: 0, x: -36 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div className="mb-5 inline-flex items-center rounded border border-teal-200 bg-teal-50 px-3 py-1 font-mono text-[11px] font-semibold tracking-[0.4px] text-teal-700">
              LA REGLA
            </div>
            <h2 className="mt-5 text-[52px] font-semibold leading-[1.02] tracking-[-1.8px] text-gray-900 lg:text-[56px]">
              Trazabilidad<br /><span className="text-teal-600">garantizada.</span>
            </h2>
            <p className="mt-7 max-w-[560px] text-[18px] leading-[1.6] text-gray-600">
              RQA-Tracer aplica una regla clave:{' '}
              <strong className="text-gray-900">
                una historia de usuario no puede marcarse como &ldquo;Completada&rdquo; hasta tener al menos un caso de prueba aprobado.
              </strong>{' '}
              Así verificás que cada funcionalidad entregada fue probada.
            </p>
            <ul className="mt-8 flex flex-col gap-3" role="list">
              {RULE_ITEMS.map((item, i) => (
                <motion.li
                  key={item.title}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  whileHover={{ x: 4, transition: SPRING }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ delay: i * 0.1, ease: EASE, duration: 0.4 }}
                  className="flex items-start gap-3"
                >
                  <div className="mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-teal-50 text-[12px] text-teal-600">✓</div>
                  <div>
                    <div className="text-[15px] font-medium text-gray-900">{item.title}</div>
                    <div className="text-[13.5px] leading-[1.5] text-gray-500">{item.body}</div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 36 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            className="rounded-2xl border border-gray-200 bg-white p-7"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-[11px] text-gray-400">US-208</span>
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, ...SPRING }}
                className="rounded border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700"
              >
                Bloqueado
              </motion.span>
            </div>
            <h4 className="mb-[18px] text-[18px] font-semibold text-gray-900">Calcular impuestos por región</h4>

            {/* Chain steps — animate sequentially */}
            <div className="mb-[18px] flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
              {[
                { label: 'Pendiente',   cls: 'bg-white text-gray-600 border-gray-200',                      delay: 0.25 },
                { label: 'En progreso', cls: 'bg-white text-gray-600 border-gray-200',                      delay: 0.37 },
                { label: 'Completada',  cls: 'bg-white text-gray-400 border-gray-200 line-through opacity-50', delay: 0.49 },
              ].map(({ label, cls, delay }, i) => (
                <Fragment key={label}>
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ delay, ease: EASE, duration: 0.35 }}
                    className={`rounded border px-2.5 py-1.5 ${cls}`}
                  >
                    {label}
                  </motion.span>
                  {i < 2 && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: delay + 0.08 }}
                      className="text-gray-400"
                    >
                      →
                    </motion.span>
                  )}
                </Fragment>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, ease: EASE, duration: 0.4 }}
              className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-100 bg-red-50 px-3.5 py-3"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <p className="text-[13px] text-red-800">
                <strong>No se puede completar</strong>: 0 / 1 casos de prueba aprobados requeridos.
              </p>
            </motion.div>

            <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.5px] text-gray-400">Casos vinculados (1)</div>
            <div className="mb-5 flex items-center justify-between rounded-lg border border-gray-200 border-l-[3px] border-l-amber-400 bg-white px-3.5 py-2.5">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-gray-400">TC-208.1</span>
                <span className="text-[13px] text-gray-900">Cálculo de IVA España</span>
              </div>
              <span className="rounded border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">Sin ejecutar</span>
            </div>

            <div className="rounded-lg border border-dashed border-gray-200 bg-white px-3 py-2.5">
              <p className="font-mono text-[12px] text-gray-500">
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

// ─── Final CTA ─────────────────────────────────────────────────────────────────

function FinalCTASection() {
  return (
    <section className="bg-teal-600 px-8 py-[120px]">
      <div className="mx-auto max-w-[880px] text-center">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <div className="mb-6 inline-flex items-center gap-1.5 rounded border border-white/30 bg-white/15 px-3 py-1 text-[11px] font-medium text-white">
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-[5px] w-[5px] rounded-full bg-white"
            />
            Listo para usar en segundos
          </div>
          <h2 className="mt-6 text-[60px] font-semibold leading-[1] tracking-[-2.2px] text-white sm:text-[72px]">
            Empezá a documentar hoy.
          </h2>
          <p className="mt-5 text-[18px] leading-[1.55] text-teal-100">
            Gratis, sin instalación, listo en segundos.<br />
            Tu primer proyecto está listo en menos de 4 minutos.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            {/* Primary with pulse ring */}
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-lg bg-white/30 blur-sm"
              />
              <Button
                size="lg"
                className="relative h-12 gap-2 bg-white px-[22px] text-[14.5px] font-medium text-teal-700 shadow-lg shadow-black/10 hover:bg-teal-50"
                asChild
              >
                <Link href="/register">
                  Comenzar gratis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <Button
              size="lg"
              variant="outline"
              className="h-12 border-white/40 bg-transparent px-[22px] text-[14.5px] font-medium text-white hover:bg-white/10"
              asChild
            >
              <Link href="/login">Ya tengo cuenta</Link>
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap justify-center gap-7" role="list">
            {VALUE_PROPS.map((item, i) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.07, ease: EASE, duration: 0.4 }}
                className="flex items-center gap-2 text-[13.5px] text-teal-100"
              >
                <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true" className="shrink-0">
                  <circle cx="10" cy="10" r="9" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1" />
                  <path d="M6 10.5l2.5 2.5L14 7.5" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-gray-900 px-8 py-10">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4">
        <Link href="/" className="flex items-center" aria-label="RQA-Tracer">
          <Image src="/logo.png" alt="RQA·Tracer" width={120} height={120} className="h-10 w-auto opacity-80" />
        </Link>
        <div className="font-mono text-[12.5px] text-gray-500">Proyecto académico · v1.0 · 2026</div>
        <nav className="flex gap-5 text-[12.5px] text-gray-500">
          <a href="#acerca" className="transition-colors hover:text-gray-300">Acerca</a>
          <a href="#docs"   className="transition-colors hover:text-gray-300">Documentación</a>
          <a href="#github" className="transition-colors hover:text-gray-300">GitHub</a>
        </nav>
      </div>
    </footer>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <ScrollProgress />
      <Navbar />
      <HeroSection />
      <MetricsBand />
      <ToolsSection />
      <HowItWorksSection />
      <TheRuleSection />
      <FinalCTASection />
      <Footer />
    </div>
  )
}
