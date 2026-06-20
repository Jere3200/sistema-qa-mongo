'use server'

import { prisma } from '@/lib/prisma'
import type { ChatMessage } from '@/lib/types'
import { requireUserId, assertProjectAccess, getUserNameMap, isValidObjectId } from './access'

export async function getMessages(projectId: string): Promise<ChatMessage[]> {
  if (!isValidObjectId(projectId)) return []
  const userId = await requireUserId()
  await assertProjectAccess(userId, projectId)
  const rows = await prisma.projectMessage.findMany({
    where: { projectId },
    orderBy: { createdAt: 'asc' },
    take: 200,
  })
  const names = await getUserNameMap(rows.map((r) => r.userId))
  return rows.map((r) => ({
    id: r.id,
    projectId: r.projectId,
    userId: r.userId,
    userName: names.get(r.userId) ?? 'Usuario',
    content: r.content,
    createdAt: r.createdAt,
  }))
}

export async function sendMessage(projectId: string, content: string): Promise<ChatMessage> {
  const userId = await requireUserId()
  await assertProjectAccess(userId, projectId)
  const trimmed = content.trim()
  if (!trimmed) throw new Error('El mensaje no puede estar vacío')

  const row = await prisma.projectMessage.create({
    data: { projectId, userId, content: trimmed },
  })
  const names = await getUserNameMap([userId])
  return {
    id: row.id,
    projectId: row.projectId,
    userId: row.userId,
    userName: names.get(userId) ?? 'Usuario',
    content: row.content,
    createdAt: row.createdAt,
  }
}
