const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

/**
 * Verifica un token de Cloudflare Turnstile.
 * Si TURNSTILE_SECRET_KEY no está configurada, devuelve true (CAPTCHA deshabilitado),
 * así la app funciona en desarrollo o sin claves todavía.
 */
export async function verifyTurnstile(token: string | undefined, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true
  if (!token) return false

  try {
    const body = new URLSearchParams({ secret, response: token })
    if (ip && ip !== 'unknown') body.append('remoteip', ip)

    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
    })
    const data = (await res.json()) as { success?: boolean }
    return data.success === true
  } catch {
    return false
  }
}
