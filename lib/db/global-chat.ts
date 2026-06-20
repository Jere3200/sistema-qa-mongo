'use server'

import { prisma } from '@/lib/prisma'
import type { GlobalMessage } from '@/lib/types'
import { requireUserId, getUserNameMap } from './access'

export async function getGlobalMessages(): Promise<GlobalMessage[]> {
  await requireUserId()
  const rows = await prisma.globalMessage.findMany({
    orderBy: { createdAt: 'asc' },
    take: 200,
  })
  const names = await getUserNameMap(rows.map((r) => r.userId))
  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    userName: names.get(r.userId) ?? 'Usuario',
    content: r.content,
    createdAt: r.createdAt,
  }))
}

export async function sendGlobalMessage(content: string): Promise<GlobalMessage> {
  const userId = await requireUserId()
  const trimmed = content.trim()
  if (!trimmed) throw new Error('El mensaje no puede estar vacío')

  const row = await prisma.globalMessage.create({ data: { userId, content: trimmed } })
  const names = await getUserNameMap([userId])
  return {
    id: row.id,
    userId: row.userId,
    userName: names.get(userId) ?? 'Usuario',
    content: row.content,
    createdAt: row.createdAt,
  }
}
