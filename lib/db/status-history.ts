'use server'

import { prisma } from '@/lib/prisma'
import type { StatusHistoryEntry } from '@/lib/types'
import { requireUserId, getUserNameMap, isValidObjectId, assertStoryAccess } from './access'

export async function getStatusHistory(storyId: string): Promise<StatusHistoryEntry[]> {
  if (!isValidObjectId(storyId)) return []
  const userId = await requireUserId()
  await assertStoryAccess(userId, storyId)
  const rows = await prisma.statusHistory.findMany({
    where: { storyId },
    orderBy: { changedAt: 'desc' },
  })
  const names = await getUserNameMap(rows.map((r) => r.changedBy))
  return rows.map((r) => ({
    id: r.id,
    storyId: r.storyId,
    oldStatus: r.oldStatus,
    newStatus: r.newStatus,
    changedBy: r.changedBy,
    authorName: names.get(r.changedBy) ?? 'Usuario',
    changedAt: r.changedAt,
  }))
}

export async function logStatusChange(params: {
  storyId: string
  oldStatus: string
  newStatus: string
}): Promise<void> {
  const userId = await requireUserId()
  await assertStoryAccess(userId, params.storyId)
  await prisma.statusHistory.create({
    data: {
      storyId: params.storyId,
      oldStatus: params.oldStatus,
      newStatus: params.newStatus,
      changedBy: userId,
    },
  })
}
