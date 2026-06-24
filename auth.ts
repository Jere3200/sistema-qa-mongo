import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { verifyTurnstile } from '@/lib/services/turnstile'

const LOGIN_WINDOW_MS = 15 * 60 * 1000

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 días
    updateAge: 24 * 60 * 60, // refresca el token cada 24h de actividad
  },
  providers: [
    Google,
    Credentials({
      async authorize(credentials, request) {
        const rawEmail = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined
        if (!rawEmail || !password) return null
        const email = rawEmail.toLowerCase().trim()
        const ip = request?.headers ? getClientIp(request.headers) : 'unknown'

        // CAPTCHA (si está configurado) — antes de tocar la DB.
        const turnstileToken = credentials?.turnstileToken as string | undefined
        const captchaOk = await verifyTurnstile(turnstileToken, ip)
        if (!captchaOk) return null

        // Rate limit por IP para frenar fuerza bruta (evita bloqueo por cuenta).
        const limit = await checkRateLimit(`login:${ip}`, 20, LOGIN_WINDOW_MS)
        if (!limit.allowed) return null

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user?.hashedPassword) return null

        const isValid = await bcrypt.compare(password, user.hashedPassword)
        if (!isValid) return null

        return { id: user.id, name: user.name, email: user.email, role: user.role ?? 'user' }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role ?? 'user'
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? ''
        session.user.role = token.role ?? 'user'
      }
      return session
    },
  },
})
