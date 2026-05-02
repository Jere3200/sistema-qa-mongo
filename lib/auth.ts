import { createClient } from '@/lib/supabase/client'

export interface SesionActiva {
  id: string
  nombre: string
  email: string
  loginEn: string
}

function mapUser(user: { id: string; email?: string; user_metadata?: Record<string, string> }): SesionActiva {
  return {
    id: user.id,
    nombre: user.user_metadata?.nombre || user.email?.split('@')[0] || 'Usuario',
    email: user.email || '',
    loginEn: new Date().toISOString(),
  }
}

export async function registrarUsuario(
  nombre: string,
  email: string,
  password: string
): Promise<SesionActiva> {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email: email.toLowerCase().trim(),
    password,
    options: { data: { nombre: nombre.trim() } },
  })
  if (error) throw new Error(error.message)
  if (!data.user) throw new Error('Error al crear el usuario')
  return mapUser(data.user)
}

export async function iniciarSesion(
  email: string,
  password: string
): Promise<SesionActiva | null> {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password,
  })
  if (error || !data.user) return null
  return mapUser(data.user)
}

export async function cerrarSesion(): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signOut()
}

export async function obtenerSesion(): Promise<SesionActiva | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return mapUser(user)
}
