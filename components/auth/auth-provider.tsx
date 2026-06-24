'use client'

import { createContext, useContext } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'

export interface SesionActiva {
  id: string
  nombre: string
  email: string
  loginEn: string
}

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
  const { data: session, status } = useSession()

  const sesion: SesionActiva | null = session?.user
    ? {
        id: (session.user as { id?: string }).id ?? '',
        nombre: session.user.name ?? session.user.email?.split('@')[0] ?? 'Usuario',
        email: session.user.email ?? '',
        loginEn: new Date().toISOString(),
      }
    : null

  async function iniciarSesion(email: string, password: string): Promise<boolean> {
    const result = await signIn('credentials', { email, password, redirect: false })
    return !result?.error
  }

  async function registrar(
    _nombre: string,
    _email: string,
    _password: string
  ): Promise<{ confirmacionRequerida: boolean }> {
    return { confirmacionRequerida: false }
  }

  async function cerrarSesion(): Promise<void> {
    // Esperamos a que se limpie la cookie (redirect:false) y recién ahí navegamos
    // con una recarga dura, para evitar quedar con sesión "stale".
    await signOut({ redirect: false })
    window.location.assign('/login')
  }

  async function solicitarResetPassword(_email: string): Promise<void> {
    throw new Error('Función no disponible en este sistema')
  }

  return (
    <AuthContexto.Provider
      value={{ sesion, cargando: status === 'loading', iniciarSesion, registrar, cerrarSesion, solicitarResetPassword }}
    >
      {children}
    </AuthContexto.Provider>
  )
}

export function useAuth(): AuthContextoTipo {
  const contexto = useContext(AuthContexto)
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return contexto
}
