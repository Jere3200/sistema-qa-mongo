'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TestTube2, Loader2, ArrowLeft, BookOpen, GitCompare, FlaskConical } from 'lucide-react'
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

const esquemaRegistro = z
  .object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Ingresá un email válido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmarPassword: z.string(),
  })
  .refine((datos) => datos.password === datos.confirmarPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarPassword'],
  })

type DatosRegistro = z.infer<typeof esquemaRegistro>

const brandFeatures = [
  { icon: BookOpen, text: 'Historias de usuario con criterios de aceptación' },
  { icon: FlaskConical, text: 'Casos de prueba en formato Gherkin' },
  { icon: GitCompare, text: 'Matriz de trazabilidad automática' },
]

export default function RegisterPage() {
  const { registrar } = useAuth()
  const router = useRouter()
  const [errorGeneral, setErrorGeneral] = useState('')
  const [cargando, setCargando] = useState(false)

  const form = useForm<DatosRegistro>({
    resolver: zodResolver(esquemaRegistro),
    defaultValues: { nombre: '', email: '', password: '', confirmarPassword: '' },
  })

  async function onSubmit(datos: DatosRegistro) {
    setCargando(true)
    setErrorGeneral('')
    try {
      await registrar(datos.nombre, datos.email, datos.password)
      router.push('/dashboard')
    } catch (error) {
      setErrorGeneral(
        error instanceof Error ? error.message : 'Ocurrió un error al registrarse.'
      )
      setCargando(false)
    }
  }

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
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="flex size-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <TestTube2 className="size-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">RQA-Tracer</span>
          </div>

          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Creá tu cuenta y comenzá<br />a documentar tus proyectos
          </h2>

          <p className="text-teal-100 leading-relaxed text-sm">
            Registrarte es gratis y no requiere configuración. En menos de un minuto
            podés tener tu primer proyecto documentado.
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
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <div className="flex size-8 items-center justify-center rounded-lg bg-teal-600 text-white">
              <TestTube2 className="size-4" />
            </div>
            <span className="font-bold text-gray-900">RQA-Tracer</span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Crear cuenta</h1>
              <p className="mt-1.5 text-sm text-gray-500">
                Completá el formulario para comenzar gratis
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 text-sm font-medium">Nombre completo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Juan Pérez"
                          autoComplete="name"
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
                          placeholder="Mínimo 6 caracteres"
                          autoComplete="new-password"
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
                  name="confirmarPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 text-sm font-medium">Confirmar contraseña</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Repetí tu contraseña"
                          autoComplete="new-password"
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
                  className="w-full h-11 bg-teal-600 text-white hover:bg-teal-700 font-semibold shadow-sm mt-2"
                  disabled={cargando}
                >
                  {cargando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
                </Button>
              </form>
            </Form>

            <p className="mt-6 text-center text-sm text-gray-500">
              ¿Ya tenés cuenta?{' '}
              <Link href="/login" className="text-teal-600 font-medium hover:text-teal-700 transition-colors">
                Iniciá sesión
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
