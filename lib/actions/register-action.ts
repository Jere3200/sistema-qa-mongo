'use server'

import { headers } from 'next/headers'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createUserSchema } from '@/lib/validations/user'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { verifyTurnstile } from '@/lib/services/turnstile'
import { sendAccountExistsEmail } from '@/lib/services/email'

const HOUR_MS = 60 * 60 * 1000

export async function registerUser(
  nombre: string,
  email: string,
  password: string,
  turnstileToken?: string
): Promise<void> {
  const ip = getClientIp(await headers())
  const limit = await checkRateLimit(`register:${ip}`, 10, HOUR_MS)
  if (!limit.allowed) throw new Error('Demasiados registros desde esta red. Probá de nuevo más tarde.')

  const captchaOk = await verifyTurnstile(turnstileToken, ip)
  if (!captchaOk) throw new Error('Verificación de seguridad fallida. Recargá la página e intentá de nuevo.')

  const parsed = createUserSchema.safeParse({ name: nombre, email, password })
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)
  const { name, email: normalizedEmail, password: validPassword } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (existing) {
    // Anti-enumeración: respondemos igual que un registro exitoso y avisamos por email.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL
    if (appUrl) await sendAccountExistsEmail(normalizedEmail, `${appUrl.replace(/\/$/, '')}/login`)
    return
  }

  const hashedPassword = await bcrypt.hash(validPassword, 12)
  await prisma.user.create({
    // role se fija a 'user' explícitamente: el registro nunca puede crear admins.
    data: { name, email: normalizedEmail, hashedPassword, role: 'user' },
  })
}
