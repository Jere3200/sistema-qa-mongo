import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { updateUserSchema } from '@/lib/validations/user'
import { getAuthenticatedUser, isAdmin } from '@/lib/auth/guards'

function unauthorized() {
  return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })
}

function forbidden() {
  return NextResponse.json({ success: false, error: 'No tenés permisos para esta acción.' }, { status: 403 })
}

type Params = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: Params) {
  const caller = await getAuthenticatedUser()
  if (!caller) return unauthorized()

  const { id } = await params

  // Solo un admin puede editar a otros usuarios; el resto solo a sí mismo.
  if (!isAdmin(caller) && caller.id !== id) return forbidden()

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Body inválido.' }, { status: 400 })
  }

  const parsed = updateUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 422 }
    )
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (existing && existing.id !== id) {
    return NextResponse.json(
      { success: false, error: 'Ya existe otra cuenta con ese email.' },
      { status: 409 }
    )
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      ...(parsed.data.password ? { hashedPassword: await bcrypt.hash(parsed.data.password, 12) } : {}),
    },
    select: { id: true, name: true, email: true },
  })

  return NextResponse.json({ success: true, data: user })
}

export async function DELETE(_request: Request, { params }: Params) {
  const caller = await getAuthenticatedUser()
  if (!caller) return unauthorized()
  if (!isAdmin(caller)) return forbidden()

  const { id } = await params

  if (caller.id === id) {
    return NextResponse.json(
      { success: false, error: 'No podés eliminar tu propio usuario.' },
      { status: 403 }
    )
  }

  await prisma.user.delete({ where: { id } })

  return NextResponse.json({ success: true, data: null })
}
