'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { Module } from '@/lib/types'
import { toModule } from './mappers'
import { createModuleSchema, updateModuleSchema } from '@/lib/validations/qa'
import { requireUserId, assertProjectAccess, isValidObjectId } from './access'

export async function getModules(projectId: string): Promise<Module[]> {
  if (!isValidObjectId(projectId)) return []
  const userId = await requireUserId()
  await assertProjectAccess(userId, projectId)
  const rows = await prisma.module.findMany({
    where: { projectId },
    orderBy: { order: 'asc' },
  })
  return rows.map(toModule)
}

export async function getModule(id: string): Promise<Module | undefined> {
  if (!isValidObjectId(id)) return undefined
  const userId = await requireUserId()
  const row = await prisma.module.findUnique({ where: { id } })
  if (!row) return undefined
  await assertProjectAccess(userId, row.projectId)
  return toModule(row)
}

export async function createModule(data: Omit<Module, 'id' | 'createdAt'>): Promise<Module> {
  const userId = await requireUserId()
  const parsed = createModuleSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)
  await assertProjectAccess(userId, parsed.data.projectId)
  const row = await prisma.module.create({
    data: {
      projectId: parsed.data.projectId,
      name: parsed.data.name,
      description: parsed.data.description,
      order: parsed.data.order,
    },
  })
  revalidatePath(`/proyectos/${data.projectId}`)
  return toModule(row)
}

export async function updateModule(id: string, data: Partial<Module>): Promise<Module | undefined> {
  if (!isValidObjectId(id)) return undefined
  const userId = await requireUserId()
  const existing = await prisma.module.findUnique({ where: { id }, select: { projectId: true } })
  if (!existing) return undefined
  await assertProjectAccess(userId, existing.projectId)
  const parsed = updateModuleSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)
  const fields = parsed.data
  const row = await prisma.module.update({
    where: { id },
    data: {
      ...(fields.name !== undefined ? { name: fields.name } : {}),
      ...(fields.description !== undefined ? { description: fields.description } : {}),
      ...(fields.order !== undefined ? { order: fields.order } : {}),
    },
  })
  revalidatePath(`/proyectos/${row.projectId}`)
  return toModule(row)
}

export async function deleteModule(id: string): Promise<boolean> {
  if (!isValidObjectId(id)) return false
  const userId = await requireUserId()
  const existing = await prisma.module.findUnique({ where: { id }, select: { projectId: true } })
  if (!existing) return false
  await assertProjectAccess(userId, existing.projectId)
  await prisma.userStory.updateMany({ where: { moduleId: id }, data: { moduleId: null } })
  await prisma.module.delete({ where: { id } })
  revalidatePath(`/proyectos/${existing.projectId}`)
  return true
}
