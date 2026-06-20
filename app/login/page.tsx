'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, GitCompare, FlaskConical } from 'lucide-react'
import { motion } from 'framer-motion'
import { Input, Button } from '@heroui/react'

const brandFeatures = [
  { icon: BookOpen, text: 'Historias de usuario con criterios de aceptación' },
  { icon: FlaskConical, text: 'Casos de prueba en formato Gherkin' },
  { icon: GitCompare, text: 'Matriz de trazabilidad automática' },
]

const DEFAULT_REDIRECT = '/dashboard'

function getSafeRedirect(target: string | null): string {
  if (!target) return DEFAULT_REDIRECT
  const isInternalPath =
    target.startsWith('/') && !target.startsWith('//') && !target.startsWith('/\\')
  return isInternalPath ? target : DEFAULT_REDIRECT
}

function FormularioLogin() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registrado = searchParams.get('registrado') === '1'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function handleSubmit() {
    if (!email || !password) {
      setError('Completá todos los campos.')
      return
    }
    setCargando(true)
    setError('')
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    if (result?.error) {
      setError('Email o contraseña incorrectos. Verificá tus datos.')
      setCargando(false)
    } else {
      router.push(getSafeRedirect(searchParams.get('redirigir')))
    }
  }

  async function handleGoogle() {
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="space-y-4">
      {registrado && (
        <p className="text-xs text-teal-700 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2.5">
          ¡Cuenta creada exitosamente! Iniciá sesión para continuar.
        </p>
      )}

      <Input
        label="Email"
        type="email"
        placeholder="tu@email.com"
        autoComplete="email"
        value={email}
        onValueChange={setEmail}
        variant="bordered"
        classNames={{ inputWrapper: 'border-gray-200' }}
      />

      <Input
        label="Contraseña"
        type="password"
        placeholder="••••••••"
        autoComplete="current-password"
        value={password}
        onValueChange={setPassword}
        variant="bordered"
        classNames={{ inputWrapper: 'border-gray-200' }}
        description={
          <Link href="/forgot-password" className="text-xs text-teal-600 hover:text-teal-700 font-medium">
            ¿Olvidaste tu contraseña?
          </Link>
        }
      />

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
          {error}
        </p>
      )}

      <Button
        onPress={handleSubmit}
        isLoading={cargando}
        className="w-full h-11 bg-teal-600 text-white font-semibold"
        color="primary"
      >
        {cargando ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </Button>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs text-gray-400">
          <span className="bg-white px-2">o continuá con</span>
        </div>
      </div>

      <Button
        onPress={handleGoogle}
        variant="bordered"
        className="w-full h-11 border-gray-200 text-gray-700 font-medium"
      >
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Iniciar sesión con Google
      </Button>
    </div>
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

            <Suspense fallback={<div className="py-8 text-center text-sm text-gray-400">Cargando...</div>}>
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
              ← Volver al inicio
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
