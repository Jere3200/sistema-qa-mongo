import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createUserSchema } from '@/lib/validations/user'
import { getAuthenticatedUser, isAdmin } from '@/lib/auth/guards'

function unauthorized() {
  return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })
}

function forbidden() {
  return NextResponse.json({ success: false, error: 'No tenés permisos para esta acción.' }, { status: 403 })
}

export async function GET() {
  const caller = await getAuthenticatedUser()
  if (!caller) return unauthorized()
  if (!isAdmin(caller)) return forbidden()

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({ success: true, data: users })
}

export async function POST(request: Request) {
  const caller = await getAuthenticatedUser()
  if (!caller) return unauthorized()
  if (!isAdmin(caller)) return forbidden()

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Body inválido.' }, { status: 400 })
  }

  const parsed = createUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 422 }
    )
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (existing) {
    return NextResponse.json(
      { success: false, error: 'Ya existe una cuenta con ese email.' },
      { status: 409 }
    )
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12)
  const user = await prisma.user.create({
    data: { name: parsed.data.name, email: parsed.data.email, hashedPassword },
    select: { id: true, name: true, email: true },
  })

  return NextResponse.json({ success: true, data: user }, { status: 201 })
}
