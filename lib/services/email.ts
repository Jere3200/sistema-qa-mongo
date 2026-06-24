import { Resend } from 'resend'

const EMAIL_FROM = process.env.EMAIL_FROM ?? 'onboarding@resend.dev'

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY no está configurada')
  return new Resend(apiKey)
}

function resetPasswordTemplate(resetUrl: string): string {
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#0f172a">
    <h1 style="font-size:20px;font-weight:700;margin:0 0 8px">Restablecé tu contraseña</h1>
    <p style="font-size:14px;line-height:1.6;color:#475569;margin:0 0 24px">
      Recibimos una solicitud para restablecer la contraseña de tu cuenta en RQA·Tracer.
      Hacé clic en el botón para elegir una nueva. El enlace expira en 1 hora.
    </p>
    <a href="${resetUrl}"
       style="display:inline-block;background:#0d9488;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:10px">
      Restablecer contraseña
    </a>
    <p style="font-size:12px;line-height:1.6;color:#94a3b8;margin:24px 0 0">
      Si no solicitaste este cambio, podés ignorar este correo de forma segura.
    </p>
  </div>`
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const resend = getResendClient()
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: 'Restablecé tu contraseña — RQA·Tracer',
    html: resetPasswordTemplate(resetUrl),
  })
  if (error) throw new Error(error.message)
}

function accountExistsTemplate(loginUrl: string): string {
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#0f172a">
    <h1 style="font-size:20px;font-weight:700;margin:0 0 8px">Ya tenés una cuenta</h1>
    <p style="font-size:14px;line-height:1.6;color:#475569;margin:0 0 24px">
      Alguien intentó registrarse en RQA·Tracer con este email, pero ya existe una cuenta asociada.
      Si fuiste vos, simplemente iniciá sesión. Si olvidaste tu contraseña, podés restablecerla.
    </p>
    <a href="${loginUrl}"
       style="display:inline-block;background:#0d9488;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:10px">
      Iniciar sesión
    </a>
    <p style="font-size:12px;line-height:1.6;color:#94a3b8;margin:24px 0 0">
      Si no fuiste vos, podés ignorar este correo de forma segura.
    </p>
  </div>`
}

/** Best-effort: avisa que ya existe una cuenta. Nunca lanza (no debe romper el registro). */
export async function sendAccountExistsEmail(to: string, loginUrl: string): Promise<void> {
  try {
    const resend = getResendClient()
    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: 'Ya tenés una cuenta en RQA·Tracer',
      html: accountExistsTemplate(loginUrl),
    })
  } catch {
    /* silencioso: el registro debe responder igual exista o no la cuenta */
  }
}
