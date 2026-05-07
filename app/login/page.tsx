'use client'

import { Suspense, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2, ArrowLeft, BookOpen, GitCompare, FlaskConical } from 'lucide-react'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useAuth } from '@/components/auth/auth-provider'

const esquemaLogin = z.object({
  email: z.string().email('Ingresá un email válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

type DatosLogin = z.infer<typeof esquemaLogin>

const brandFeatures = [
  { icon: BookOpen, text: 'Historias de usuario con criterios de aceptación' },
  { icon: FlaskConical, text: 'Casos de prueba en formato Gherkin' },
  { icon: GitCompare, text: 'Matriz de trazabilidad automática' },
]

function FormularioLogin() {
  const { iniciarSesion } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorGeneral, setErrorGeneral] = useState('')
  const [cargando, setCargando] = useState(false)

  const form = useForm<DatosLogin>({
    resolver: zodResolver(esquemaLogin),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(datos: DatosLogin) {
    setCargando(true)
    setErrorGeneral('')
    const exito = await iniciarSesion(datos.email, datos.password)
    if (exito) {
      router.push(searchParams.get('redirigir') ?? '/dashboard')
    } else {
      setErrorGeneral('Email o contraseña incorrectos. Verificá tus datos.')
      setCargando(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 text-sm font-medium">Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  autoComplete="email"
                  className="h-11 border-gray-200 focus-visible:ring-teal-500/30 focus-visible:border-teal-500"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-500 text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 text-sm font-medium">Contraseña</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-11 border-gray-200 focus-visible:ring-teal-500/30 focus-visible:border-teal-500"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-500 text-xs" />
            </FormItem>
          )}
        />

        {errorGeneral && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
            {errorGeneral}
          </p>
        )}

        <Button
          type="submit"
          className="w-full h-11 bg-teal-600 text-white hover:bg-teal-700 font-semibold shadow-sm"
          disabled={cargando}
        >
          {cargando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {cargando ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </Button>
      </form>
    </Form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">

      {/* Lado izquierdo — branding */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-teal-600 p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-sm text-center"
        >
          <div className="flex items-center justify-center mb-10">
            <Image src="/logo.png" alt="RQA·Tracer" width={160} height={160} className="h-16 w-auto brightness-0 invert" />
          </div>

          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Trazabilidad de Requisitos<br />y Calidad de Software
          </h2>

          <p className="text-teal-100 leading-relaxed text-sm">
            Documentá historias de usuario, casos de prueba y la trazabilidad completa
            entre requisitos y pruebas en un solo lugar.
          </p>

          <div className="mt-10 space-y-3">
            {brandFeatures.map((f, i) => (
              <motion.div
                key={f.text}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-left"
              >
                <f.icon className="size-4 text-teal-200 shrink-0" />
                <span className="text-sm text-white/90">{f.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Lado derecho — formulario */}
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          {/* Logo mobile */}
          <div className="flex lg:hidden justify-center mb-8">
            <Image src="/logo.png" alt="RQA·Tracer" width={120} height={120} className="h-10 w-auto" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Iniciar sesión</h1>
              <p className="mt-1.5 text-sm text-gray-500">
                Ingresá tus credenciales para acceder al panel
              </p>
            </div>

            <Suspense fallback={
              <div className="flex items-center justify-center gap-2 text-gray-400 py-8">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Cargando...</span>
              </div>
            }>
              <FormularioLogin />
            </Suspense>

            <p className="mt-6 text-center text-sm text-gray-500">
              ¿No tenés cuenta?{' '}
              <Link href="/register" className="text-teal-600 font-medium hover:text-teal-700 transition-colors">
                Registrate gratis
              </Link>
            </p>
          </div>

          <div className="mt-5 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver al inicio
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
