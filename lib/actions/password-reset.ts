'use server'

import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/services/email'

type ResetResult = { success: true } | { success: false; error: string }

const TOKEN_TTL_MS = 60 * 60 * 1000 // 1 hora
const MIN_PASSWORD_LENGTH = 6

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

// La base de la URL se lee de configuración de confianza del servidor, nunca
// del header Host (previene host header injection / password reset poisoning).
function buildResetUrl(rawToken: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL
  if (!appUrl) throw new Error('NEXT_PUBLIC_APP_URL no está configurada')
  return `${appUrl.replace(/\/$/, '')}/reset-password?token=${rawToken}`
}

/**
 * Genera un token de reset y envía el email. No revela si el email existe
 * (anti-enumeración): la UI muestra el mismo mensaje en todos los casos.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const normalized = email.toLowerCase().trim()
  const user = await prisma.user.findUnique({
    where: { email: normalized },
    select: { id: true },
  })
  if (!user) return

  await prisma.passwordResetToken.deleteMany({ where: { email: normalized } })

  const rawToken = crypto.randomBytes(32).toString('hex')
  await prisma.passwordResetToken.create({
    data: {
      email: normalized,
      token: hashToken(rawToken),
      expires: new Date(Date.now() + TOKEN_TTL_MS),
    },
  })

  const resetUrl = buildResetUrl(rawToken)
  await sendPasswordResetEmail(normalized, resetUrl)
}

export async function resetPassword(token: string, password: string): Promise<ResetResult> {
  if (!token) return { success: false, error: 'El enlace es inválido.' }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { success: false, error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.` }
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { token: hashToken(token) },
  })
  if (!record || record.expires < new Date()) {
    return { success: false, error: 'El enlace es inválido o expiró. Solicitá uno nuevo.' }
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  await prisma.user.updateMany({
    where: { email: record.email },
    data: { hashedPassword },
  })
  await prisma.passwordResetToken.deleteMany({ where: { email: record.email } })

  return { success: true }
}
