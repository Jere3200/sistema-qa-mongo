'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { UserStory, AcceptanceCriterion } from '@/lib/types'
import { toUserStory, toAcceptanceCriterion, groupBy } from './mappers'
import {
  createUserStorySchema,
  updateUserStorySchema,
  acceptanceCriterionSchema,
} from '@/lib/validations/qa'
import { requireUserId, assertProjectAccess, isValidObjectId } from './access'

async function attachCriteria(
  stories: Awaited<ReturnType<typeof prisma.userStory.findMany>>
): Promise<UserStory[]> {
  const storyIds = stories.map((s) => s.id)
  const criteria = storyIds.length
    ? await prisma.acceptanceCriterion.findMany({ where: { userStoryId: { in: storyIds } } })
    : []
  const byStory = groupBy(criteria, (c) => c.userStoryId)
  return stories.map((s) => toUserStory(s, byStory.get(s.id) ?? []))
}

export async function getUserStories(projectId: string): Promise<UserStory[]> {
  if (!isValidObjectId(projectId)) return []
  const userId = await requireUserId()
  await assertProjectAccess(userId, projectId)
  const stories = await prisma.userStory.findMany({
    where: { projectId },
    orderBy: { code: 'asc' },
  })
  return attachCriteria(stories)
}

export async function getUserStoriesByModule(moduleId: string): Promise<UserStory[]> {
  if (!isValidObjectId(moduleId)) return []
  const userId = await requireUserId()
  const mod = await prisma.module.findUnique({ where: { id: moduleId }, select: { projectId: true } })
  if (!mod) return []
  await assertProjectAccess(userId, mod.projectId)
  const stories = await prisma.userStory.findMany({
    where: { moduleId },
    orderBy: { code: 'asc' },
  })
  return attachCriteria(stories)
}

export async function getUserStory(id: string): Promise<UserStory | undefined> {
  if (!isValidObjectId(id)) return undefined
  const userId = await requireUserId()
  const row = await prisma.userStory.findUnique({ where: { id } })
  if (!row) return undefined
  await assertProjectAccess(userId, row.projectId)
  const criteria = await prisma.acceptanceCriterion.findMany({ where: { userStoryId: id } })
  return toUserStory(row, criteria)
}

export async function createUserStory(
  data: Omit<UserStory, 'id' | 'code' | 'acceptanceCriteria' | 'createdAt' | 'updatedAt'>
): Promise<UserStory> {
  const userId = await requireUserId()
  const parsed = createUserStorySchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)
  const input = parsed.data
  await assertProjectAccess(userId, input.projectId)
  const project = await prisma.project.update({
    where: { id: input.projectId },
    data: { storySeq: { increment: 1 } },
    select: { storySeq: true },
  })
  const code = `US-${String(project.storySeq).padStart(3, '0')}`
  const row = await prisma.userStory.create({
    data: {
      projectId: input.projectId,
      moduleId: input.moduleId ?? null,
      code,
      title: input.title,
      asA: input.asA,
      iWant: input.iWant,
      soThat: input.soThat,
      status: input.status,
      priority: input.priority,
      assignedTo: input.assignedTo ?? null,
    },
  })
  revalidatePath('/historias')
  revalidatePath('/dashboard')
  revalidatePath(`/proyectos/${input.projectId}`)
  return toUserStory(row, [])
}

export async function updateUserStory(
  id: string,
  data: Partial<UserStory>
): Promise<UserStory | undefined> {
  if (!isValidObjectId(id)) return undefined
  const userId = await requireUserId()
  const existing = await prisma.userStory.findUnique({ where: { id } })
  if (!existing) return undefined
  await assertProjectAccess(userId, existing.projectId)

  const parsed = updateUserStorySchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)
  const fields = parsed.data

  const row = await prisma.userStory.update({
    where: { id },
    data: {
      ...(fields.title !== undefined ? { title: fields.title } : {}),
      ...(fields.moduleId !== undefined ? { moduleId: fields.moduleId } : {}),
      ...(fields.asA !== undefined ? { asA: fields.asA } : {}),
      ...(fields.iWant !== undefined ? { iWant: fields.iWant } : {}),
      ...(fields.soThat !== undefined ? { soThat: fields.soThat } : {}),
      ...(fields.status !== undefined ? { status: fields.status } : {}),
      ...(fields.priority !== undefined ? { priority: fields.priority } : {}),
      ...(fields.assignedTo !== undefined ? { assignedTo: fields.assignedTo } : {}),
    },
  })

  if (fields.status !== undefined && fields.status !== existing.status) {
    await prisma.statusHistory.create({
      data: {
        storyId: id,
        oldStatus: existing.status,
        newStatus: fields.status,
        changedBy: userId,
      },
    })
  }

  const criteria = await prisma.acceptanceCriterion.findMany({ where: { userStoryId: id } })
  revalidatePath('/historias')
  revalidatePath(`/historias/${id}`)
  revalidatePath('/dashboard')
  return toUserStory(row, criteria)
}

export async function deleteUserStory(id: string): Promise<boolean> {
  if (!isValidObjectId(id)) return false
  const userId = await requireUserId()
  const existing = await prisma.userStory.findUnique({ where: { id }, select: { projectId: true } })
  if (!existing) return false
  await assertProjectAccess(userId, existing.projectId)

  await prisma.acceptanceCriterion.deleteMany({ where: { userStoryId: id } })
  await prisma.testCase.deleteMany({ where: { userStoryId: id } })
  await prisma.comment.deleteMany({ where: { userStoryId: id } })
  await prisma.statusHistory.deleteMany({ where: { storyId: id } })
  await prisma.userStory.delete({ where: { id } })

  revalidatePath('/historias')
  revalidatePath('/dashboard')
  return true
}

export async function addAcceptanceCriterion(
  userStoryId: string,
  description: string
): Promise<AcceptanceCriterion> {
  if (!isValidObjectId(userStoryId)) throw new Error('Historia inválida')
  const userId = await requireUserId()
  const story = await prisma.userStory.findUnique({
    where: { id: userStoryId },
    select: { projectId: true },
  })
  if (!story) throw new Error('Historia no encontrada')
  await assertProjectAccess(userId, story.projectId)

  const parsed = acceptanceCriterionSchema.safeParse(description)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const order = await prisma.acceptanceCriterion.count({ where: { userStoryId } })
  const row = await prisma.acceptanceCriterion.create({
    data: { userStoryId, description: parsed.data, order },
  })
  revalidatePath(`/historias/${userStoryId}`)
  return toAcceptanceCriterion(row)
}

export async function removeAcceptanceCriterion(id: string): Promise<void> {
  if (!isValidObjectId(id)) return
  const userId = await requireUserId()
  const criterion = await prisma.acceptanceCriterion.findUnique({
    where: { id },
    select: { userStoryId: true },
  })
  if (!criterion) return
  const story = await prisma.userStory.findUnique({
    where: { id: criterion.userStoryId },
    select: { projectId: true },
  })
  if (story) await assertProjectAccess(userId, story.projectId)
  await prisma.acceptanceCriterion.delete({ where: { id } })
  revalidatePath(`/historias/${criterion.userStoryId}`)
}

export async function replaceAcceptanceCriteria(
  userStoryId: string,
  descriptions: string[]
): Promise<AcceptanceCriterion[]> {
  if (!isValidObjectId(userStoryId)) return []
  const userId = await requireUserId()
  const story = await prisma.userStory.findUnique({
    where: { id: userStoryId },
    select: { projectId: true },
  })
  if (!story) return []
  await assertProjectAccess(userId, story.projectId)

  const cleaned: string[] = []
  for (const d of descriptions) {
    const result = acceptanceCriterionSchema.safeParse(d)
    if (result.success) cleaned.push(result.data)
    if (cleaned.length >= 100) break
  }

  await prisma.acceptanceCriterion.deleteMany({ where: { userStoryId } })
  if (cleaned.length > 0) {
    await prisma.acceptanceCriterion.createMany({
      data: cleaned.map((description, order) => ({ userStoryId, description, order })),
    })
  }
  const rows = await prisma.acceptanceCriterion.findMany({
    where: { userStoryId },
    orderBy: { order: 'asc' },
  })
  revalidatePath(`/historias/${userStoryId}`)
  return rows.map(toAcceptanceCriterion)
}
