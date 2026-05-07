'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { SesionActiva } from '@/lib/auth'

interface AuthContextoTipo {
  sesion: SesionActiva | null
  cargando: boolean
  iniciarSesion: (email: string, password: string) => Promise<boolean>
  registrar: (nombre: string, email: string, password: string) => Promise<{ confirmacionRequerida: boolean }>
  cerrarSesion: () => Promise<void>
  solicitarResetPassword: (email: string) => Promise<void>
}

const AuthContexto = createContext<AuthContextoTipo | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [sesion, setSesion] = useState<SesionActiva | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setSesion({
          id: user.id,
          nombre: user.user_metadata?.nombre || user.email?.split('@')[0] || 'Usuario',
          email: user.email || '',
          loginEn: new Date().toISOString(),
        })
      }
      setCargando(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSesion({
          id: session.user.id,
          nombre: session.user.user_metadata?.nombre || session.user.email?.split('@')[0] || 'Usuario',
          email: session.user.email || '',
          loginEn: new Date().toISOString(),
        })
      } else {
        setSesion(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function iniciarSesion(email: string, password: string): Promise<boolean> {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    })
    return !error && !!data.user
  }

  async function registrar(nombre: string, email: string, password: string): Promise<{ confirmacionRequerida: boolean }> {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: { data: { nombre: nombre.trim() } },
    })
    if (error) throw new Error(error.message)
    return { confirmacionRequerida: !data.session }
  }

  async function cerrarSesion(): Promise<void> {
    const supabase = createClient()
    await supabase.auth.signOut()
    setSesion(null)
  }

  async function solicitarResetPassword(email: string): Promise<void> {
    const supabase = createClient()
    const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.toLowerCase().trim(),
      { redirectTo }
    )
    if (error) throw new Error(error.message)
  }

  return (
    <AuthContexto.Provider value={{ sesion, cargando, iniciarSesion, registrar, cerrarSesion, solicitarResetPassword }}>
      {children}
    </AuthContexto.Provider>
  )
}

export function useAuth(): AuthContextoTipo {
  const contexto = useContext(AuthContexto)
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return contexto
}
