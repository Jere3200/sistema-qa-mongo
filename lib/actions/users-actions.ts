'use server'

import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { createUserSchema, updateUserSchema } from '@/lib/validations/user'

type ActionResult = { success: true } | { success: false; error: string }

async function requireSessionUserId(): Promise<string | null> {
  const session = await auth()
  if (!session?.user) return null
  return (session.user as { id: string }).id
}

export async function createUser(data: {
  name: string
  email: string
  password: string
}): Promise<ActionResult> {
  const callerId = await requireSessionUserId()
  if (!callerId) {
    return { success: false, error: 'No autorizado.' }
  }

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
  const callerId = await requireSessionUserId()
  if (!callerId) {
    return { success: false, error: 'No autorizado.' }
  }

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
  const callerId = await requireSessionUserId()
  if (!callerId) {
    return { success: false, error: 'No autorizado.' }
  }
  if (callerId === id) {
    return { success: false, error: 'No podés eliminar tu propio usuario.' }
  }

  await prisma.user.delete({ where: { id } })

  revalidatePath('/dashboard')
  return { success: true }
}
