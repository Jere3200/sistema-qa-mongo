import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { createUserSchema } from '@/lib/validations/user'

function unauthorized() {
  return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })
}

export async function GET() {
  const session = await auth()
  if (!session?.user) return unauthorized()

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({ success: true, data: users })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return unauthorized()

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
