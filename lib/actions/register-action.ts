'use server'

import { headers } from 'next/headers'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createUserSchema } from '@/lib/validations/user'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const HOUR_MS = 60 * 60 * 1000

export async function registerUser(nombre: string, email: string, password: string): Promise<void> {
  const ip = getClientIp(await headers())
  const limit = await checkRateLimit(`register:${ip}`, 10, HOUR_MS)
  if (!limit.allowed) throw new Error('Demasiados registros desde esta red. Probá de nuevo más tarde.')

  const parsed = createUserSchema.safeParse({ name: nombre, email, password })
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)
  const { name, email: normalizedEmail, password: validPassword } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (existing) throw new Error('Ya existe una cuenta con ese email.')

  const hashedPassword = await bcrypt.hash(validPassword, 12)
  await prisma.user.create({
    // role se fija a 'user' explícitamente: el registro nunca puede crear admins.
    data: { name, email: normalizedEmail, hashedPassword, role: 'user' },
  })
}
