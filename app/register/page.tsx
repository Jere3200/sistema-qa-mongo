'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, GitCompare, FlaskConical } from 'lucide-react'
import { motion } from 'framer-motion'
import { Input, Button } from '@heroui/react'
import { registerUser } from '@/lib/actions/register-action'
import { TurnstileWidget, isCaptchaEnabled } from '@/components/auth/turnstile-widget'

const brandFeatures = [
  { icon: BookOpen, text: 'Historias de usuario con criterios de aceptación' },
  { icon: FlaskConical, text: 'Casos de prueba en formato Gherkin' },
  { icon: GitCompare, text: 'Matriz de trazabilidad automática' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function handleSubmit() {
    setError('')
    if (!nombre || !email || !password || !confirmar) {
      setError('Completá todos los campos.')
      return
    }
    if (nombre.length < 2) {
      setError('El nombre debe tener al menos 2 caracteres.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirmar) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (isCaptchaEnabled && !captchaToken) {
      setError('Completá la verificación de seguridad.')
      return
    }

    setCargando(true)
    try {
      await registerUser(nombre, email, password, captchaToken)
      router.push('/login?registrado=1')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error al crear la cuenta.')
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
          <div className="flex items-center justify-center mb-10">
            <Image src="/logo.png" alt="RQA·Tracer" width={160} height={160} className="h-16 w-auto brightness-0 invert" />
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
          <div className="flex lg:hidden justify-center mb-8">
            <Image src="/logo.png" alt="RQA·Tracer" width={120} height={120} className="h-10 w-auto" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Crear cuenta</h1>
              <p className="mt-1.5 text-sm text-gray-500">
                Completá el formulario para comenzar gratis
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Nombre completo"
                placeholder="Juan Pérez"
                autoComplete="name"
                value={nombre}
                onValueChange={setNombre}
                variant="bordered"
                classNames={{ inputWrapper: 'border-gray-200' }}
              />

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
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                value={password}
                onValueChange={setPassword}
                variant="bordered"
                classNames={{ inputWrapper: 'border-gray-200' }}
              />

              <Input
                label="Confirmar contraseña"
                type="password"
                placeholder="Repetí tu contraseña"
                autoComplete="new-password"
                value={confirmar}
                onValueChange={setConfirmar}
                variant="bordered"
                classNames={{ inputWrapper: 'border-gray-200' }}
              />

              <TurnstileWidget onToken={setCaptchaToken} />

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                  {error}
                </p>
              )}

              <Button
                onPress={handleSubmit}
                isLoading={cargando}
                isDisabled={isCaptchaEnabled && !captchaToken}
                className="w-full h-11 bg-teal-600 text-white font-semibold mt-2"
                color="primary"
              >
                {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
              </Button>
            </div>

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
              ← Volver al inicio
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
