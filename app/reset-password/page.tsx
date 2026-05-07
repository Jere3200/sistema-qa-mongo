'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'
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
import { createClient } from '@/lib/supabase/client'

const esquema = z
  .object({
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmar: z.string(),
  })
  .refine((d) => d.password === d.confirmar, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmar'],
  })

type Datos = z.infer<typeof esquema>

export default function ResetPasswordPage() {
  const router = useRouter()
  const [exito, setExito] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState('')

  const form = useForm<Datos>({
    resolver: zodResolver(esquema),
    defaultValues: { password: '', confirmar: '' },
  })

  async function onSubmit(datos: Datos) {
    setCargando(true)
    setErrorGeneral('')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: datos.password })
      if (error) throw new Error(error.message)
      setExito(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch (err) {
      setErrorGeneral(err instanceof Error ? err.message : 'Ocurrió un error al actualizar la contraseña.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <div className="flex justify-center mb-8">
          <Image src="/logo.png" alt="RQA·Tracer" width={120} height={120} className="h-10 w-auto" />
        </div>

        {exito ? (
          <div className="bg-white rounded-2xl border border-teal-200 shadow-sm p-8 text-center">
            <div className="flex items-center justify-center size-14 rounded-full bg-teal-50 mx-auto mb-5">
              <CheckCircle2 className="size-7 text-teal-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">¡Contraseña actualizada!</h2>
            <p className="text-sm text-gray-500">Serás redirigido al login en unos segundos...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Nueva contraseña</h1>
              <p className="mt-1.5 text-sm text-gray-500">
                Elegí una nueva contraseña segura para tu cuenta.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 text-sm font-medium">Nueva contraseña</FormLabel>
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
                  name="confirmar"
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
                  {cargando ? 'Actualizando...' : 'Actualizar contraseña'}
                </Button>
              </form>
            </Form>
          </div>
        )}

        <div className="mt-5 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver al login
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
