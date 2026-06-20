'use server'

import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createUserSchema, updateUserSchema } from '@/lib/validations/user'
import { getAuthenticatedUser, isAdmin } from '@/lib/auth/guards'

type ActionResult = { success: true } | { success: false; error: string }

const FORBIDDEN: ActionResult = { success: false, error: 'No tenés permisos para esta acción.' }
const UNAUTHORIZED: ActionResult = { success: false, error: 'No autorizado.' }

export async function createUser(data: {
  name: string
  email: string
  password: string
}): Promise<ActionResult> {
  const caller = await getAuthenticatedUser()
  if (!caller) return UNAUTHORIZED
  if (!isAdmin(caller)) return FORBIDDEN

  const parsed = createUserSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (existing) {
    return { success: false, error: 'Ya existe una cuenta con ese email.' }
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12)
  await prisma.user.create({
    data: { name: parsed.data.name, email: parsed.data.email, hashedPassword },
  })

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateUser(
  id: string,
  data: { name: string; email: string; password?: string }
): Promise<ActionResult> {
  const caller = await getAuthenticatedUser()
  if (!caller) return UNAUTHORIZED
  if (!isAdmin(caller) && caller.id !== id) return FORBIDDEN

  const parsed = updateUserSchema.safeParse({ ...data, password: data.password ?? '' })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (existing && existing.id !== id) {
    return { success: false, error: 'Ya existe otra cuenta con ese email.' }
  }

  await prisma.user.update({
    where: { id },
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      ...(parsed.data.password ? { hashedPassword: await bcrypt.hash(parsed.data.password, 12) } : {}),
    },
  })

  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteUser(id: string): Promise<ActionResult> {
  const caller = await getAuthenticatedUser()
  if (!caller) return UNAUTHORIZED
  if (!isAdmin(caller)) return FORBIDDEN
  if (caller.id === id) {
    return { success: false, error: 'No podés eliminar tu propio usuario.' }
  }

  await prisma.user.delete({ where: { id } })

  revalidatePath('/dashboard')
  return { success: true }
}
