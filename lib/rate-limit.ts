import { prisma } from '@/lib/prisma'

interface RateLimitResult {
  allowed: boolean
  retryAfterMs: number
}

/**
 * Rate limiter de ventana fija respaldado en Mongo (apto para serverless).
 * Fail-open: si el almacén falla, permite la operación para no auto-bloquear la app.
 */
export async function checkRateLimit(
  key: string,
  max: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = new Date()
  try {
    const existing = await prisma.rateLimit.findUnique({ where: { key } })

    if (!existing || existing.expiresAt < now) {
      await prisma.rateLimit.upsert({
        where: { key },
        create: { key, count: 1, expiresAt: new Date(now.getTime() + windowMs) },
        update: { count: 1, expiresAt: new Date(now.getTime() + windowMs) },
      })
      return { allowed: true, retryAfterMs: 0 }
    }

    if (existing.count >= max) {
      return { allowed: false, retryAfterMs: existing.expiresAt.getTime() - now.getTime() }
    }

    await prisma.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } })
    return { allowed: true, retryAfterMs: 0 }
  } catch {
    return { allowed: true, retryAfterMs: 0 }
  }
}

/** Resetea el contador de una clave (ej. al loguear con éxito). */
export async function resetRateLimit(key: string): Promise<void> {
  try {
    await prisma.rateLimit.deleteMany({ where: { key } })
  } catch {
    /* fail-open */
  }
}

/** Extrae la IP del cliente desde los headers (Vercel setea x-forwarded-for). */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return headers.get('x-real-ip') ?? 'unknown'
}
