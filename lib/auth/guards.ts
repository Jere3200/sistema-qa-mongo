import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export const ADMIN_ROLE = 'admin'
export const DEFAULT_ROLE = 'user'

export interface AuthenticatedUser {
  id: string
  role: string
}

/**
 * Resuelve el usuario autenticado leyendo el rol fresco desde la base de datos.
 * Devuelve null si no hay sesión válida o el usuario ya no existe.
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const session = await auth()
  const id = session?.user?.id
  if (!id) return null

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  })
  if (!user) return null

  return { id: user.id, role: user.role ?? DEFAULT_ROLE }
}

export function isAdmin(user: AuthenticatedUser | null): boolean {
  return user?.role === ADMIN_ROLE
}
