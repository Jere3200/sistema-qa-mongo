'use client'

import { Turnstile } from '@marsidev/react-turnstile'

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

/** true cuando el CAPTCHA está configurado (hay site key). */
export const isCaptchaEnabled = Boolean(SITE_KEY)

interface TurnstileWidgetProps {
  onToken: (token: string) => void
}

/**
 * Widget de Cloudflare Turnstile. Si no hay site key configurada, no renderiza nada
 * (la app sigue funcionando sin CAPTCHA hasta que se carguen las claves).
 */
export function TurnstileWidget({ onToken }: TurnstileWidgetProps) {
  if (!SITE_KEY) return null
  return (
    <Turnstile
      siteKey={SITE_KEY}
      onSuccess={onToken}
      onExpire={() => onToken('')}
      onError={() => onToken('')}
      options={{ theme: 'light', size: 'flexible' }}
    />
  )
}
