'use server'

import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function registerUser(nombre: string, email: string, password: string): Promise<void> {
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
  if (existing) throw new Error('Ya existe una cuenta con ese email.')

  const hashedPassword = await bcrypt.hash(password, 12)
  await prisma.user.create({
    data: {
      name: nombre.trim(),
      email: email.toLowerCase().trim(),
      hashedPassword,
    },
  })
}
