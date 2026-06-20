'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { TestCase, TestCaseStatus } from '@/lib/types'
import { toTestCase } from './mappers'
import { requireUserId, assertProjectAccess, isValidObjectId } from './access'

export async function getTestCases(projectId: string): Promise<TestCase[]> {
  if (!isValidObjectId(projectId)) return []
  const userId = await requireUserId()
  await assertProjectAccess(userId, projectId)
  const rows = await prisma.testCase.findMany({
    where: { projectId },
    orderBy: { code: 'asc' },
  })
  return rows.map(toTestCase)
}

export async function getTestCasesByUserStory(userStoryId: string): Promise<TestCase[]> {
  if (!isValidObjectId(userStoryId)) return []
  const userId = await requireUserId()
  const story = await prisma.userStory.findUnique({
    where: { id: userStoryId },
    select: { projectId: true },
  })
  if (!story) return []
  await assertProjectAccess(userId, story.projectId)
  const rows = await prisma.testCase.findMany({
    where: { userStoryId },
    orderBy: { code: 'asc' },
  })
  return rows.map(toTestCase)
}

export async function getTestCase(id: string): Promise<TestCase | undefined> {
  if (!isValidObjectId(id)) return undefined
  const userId = await requireUserId()
  const row = await prisma.testCase.findUnique({ where: { id } })
  if (!row) return undefined
  await assertProjectAccess(userId, row.projectId)
  return toTestCase(row)
}

export async function createTestCase(
  data: Omit<TestCase, 'id' | 'code' | 'createdAt' | 'updatedAt'>
): Promise<TestCase> {
  const userId = await requireUserId()
  await assertProjectAccess(userId, data.projectId)
  const project = await prisma.project.update({
    where: { id: data.projectId },
    data: { testSeq: { increment: 1 } },
    select: { testSeq: true },
  })
  const code = `TC-${String(project.testSeq).padStart(3, '0')}`
  const row = await prisma.testCase.create({
    data: {
      projectId: data.projectId,
      userStoryId: data.userStoryId,
      code,
      title: data.title,
      preconditions: data.preconditions,
      given: data.given,
      when: data.when,
      then: data.then,
      status: data.status,
      priority: data.priority,
      notes: data.notes,
      executedAt: data.executedAt ?? null,
      executedBy: data.executedBy ?? null,
      assignedTo: data.assignedTo ?? null,
    },
  })
  revalidatePath('/casos-prueba')
  revalidatePath('/trazabilidad')
  revalidatePath('/dashboard')
  return toTestCase(row)
}

export async function updateTestCase(
  id: string,
  data: Partial<TestCase>
): Promise<TestCase | undefined> {
  if (!isValidObjectId(id)) return undefined
  const userId = await requireUserId()
  const existing = await prisma.testCase.findUnique({ where: { id }, select: { projectId: true } })
  if (!existing) return undefined
  await assertProjectAccess(userId, existing.projectId)
  const row = await prisma.testCase.update({
    where: { id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.userStoryId !== undefined ? { userStoryId: data.userStoryId } : {}),
      ...(data.preconditions !== undefined ? { preconditions: data.preconditions } : {}),
      ...(data.given !== undefined ? { given: data.given } : {}),
      ...(data.when !== undefined ? { when: data.when } : {}),
      ...(data.then !== undefined ? { then: data.then } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.priority !== undefined ? { priority: data.priority } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
      ...(data.assignedTo !== undefined ? { assignedTo: data.assignedTo } : {}),
    },
  })
  revalidatePath('/casos-prueba')
  revalidatePath('/trazabilidad')
  revalidatePath('/dashboard')
  return toTestCase(row)
}

export async function executeTestCase(
  id: string,
  status: TestCaseStatus,
  executedBy: string,
  notes: string
): Promise<TestCase | undefined> {
  if (!isValidObjectId(id)) return undefined
  const userId = await requireUserId()
  const existing = await prisma.testCase.findUnique({ where: { id }, select: { projectId: true } })
  if (!existing) return undefined
  await assertProjectAccess(userId, existing.projectId)
  const row = await prisma.testCase.update({
    where: { id },
    data: { status, notes, executedBy, executedAt: new Date() },
  })
  revalidatePath('/casos-prueba')
  revalidatePath('/trazabilidad')
  revalidatePath('/dashboard')
  return toTestCase(row)
}

export async function deleteTestCase(id: string): Promise<boolean> {
  if (!isValidObjectId(id)) return false
  const userId = await requireUserId()
  const existing = await prisma.testCase.findUnique({ where: { id }, select: { projectId: true } })
  if (!existing) return false
  await assertProjectAccess(userId, existing.projectId)
  await prisma.comment.deleteMany({ where: { testCaseId: id } })
  await prisma.testCase.delete({ where: { id } })
  revalidatePath('/casos-prueba')
  revalidatePath('/trazabilidad')
  revalidatePath('/dashboard')
  return true
}
