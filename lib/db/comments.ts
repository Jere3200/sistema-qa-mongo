'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { Comment } from '@/lib/types'
import {
  requireUserId,
  getUserNameMap,
  isValidObjectId,
  assertStoryAccess,
  assertTestCaseAccess,
} from './access'

export async function getComments(params: {
  userStoryId?: string
  testCaseId?: string
}): Promise<Comment[]> {
  const userId = await requireUserId()
  if (params.userStoryId) {
    await assertStoryAccess(userId, params.userStoryId)
  } else if (params.testCaseId) {
    await assertTestCaseAccess(userId, params.testCaseId)
  } else {
    return []
  }
  const where = params.userStoryId
    ? { userStoryId: params.userStoryId }
    : { testCaseId: params.testCaseId }

  const rows = await prisma.comment.findMany({ where, orderBy: { createdAt: 'asc' } })
  const names = await getUserNameMap(rows.map((r) => r.userId))
  return rows.map((r) => ({
    id: r.id,
    userStoryId: r.userStoryId,
    testCaseId: r.testCaseId,
    userId: r.userId,
    authorName: names.get(r.userId) ?? 'Usuario',
    content: r.content,
    createdAt: r.createdAt,
  }))
}

export async function addComment(params: {
  userStoryId?: string
  testCaseId?: string
  content: string
}): Promise<Comment> {
  const userId = await requireUserId()
  const content = params.content.trim()
  if (!content) throw new Error('El comentario no puede estar vacío')

  const hasStory = Boolean(params.userStoryId)
  const hasTestCase = Boolean(params.testCaseId)
  if (hasStory === hasTestCase) {
    throw new Error('Indicá una historia o un caso de prueba (exactamente uno)')
  }
  if (params.userStoryId) await assertStoryAccess(userId, params.userStoryId)
  if (params.testCaseId) await assertTestCaseAccess(userId, params.testCaseId)

  const row = await prisma.comment.create({
    data: {
      userStoryId: params.userStoryId ?? null,
      testCaseId: params.testCaseId ?? null,
      userId,
      content,
    },
  })
  const names = await getUserNameMap([userId])

  if (params.userStoryId) revalidatePath(`/historias/${params.userStoryId}`)
  if (params.testCaseId) revalidatePath(`/casos-prueba/${params.testCaseId}`)

  return {
    id: row.id,
    userStoryId: row.userStoryId,
    testCaseId: row.testCaseId,
    userId,
    authorName: names.get(userId) ?? 'Usuario',
    content: row.content,
    createdAt: row.createdAt,
  }
}

export async function deleteComment(id: string): Promise<void> {
  if (!isValidObjectId(id)) return
  const userId = await requireUserId()
  const comment = await prisma.comment.findUnique({ where: { id }, select: { userId: true } })
  if (!comment) return
  if (comment.userId !== userId) throw new Error('Solo podés eliminar tus propios comentarios')
  await prisma.comment.delete({ where: { id } })
}
