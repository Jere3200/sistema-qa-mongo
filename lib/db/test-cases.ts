'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { TestCase, TestCaseStatus } from '@/lib/types'
import { toTestCase } from './mappers'
import {
  createTestCaseSchema,
  updateTestCaseSchema,
  executeTestCaseSchema,
} from '@/lib/validations/qa'
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
  const parsed = createTestCaseSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)
  const input = parsed.data
  await assertProjectAccess(userId, input.projectId)
  const project = await prisma.project.update({
    where: { id: input.projectId },
    data: { testSeq: { increment: 1 } },
    select: { testSeq: true },
  })
  const code = `TC-${String(project.testSeq).padStart(3, '0')}`
  const row = await prisma.testCase.create({
    data: {
      projectId: input.projectId,
      userStoryId: input.userStoryId,
      code,
      title: input.title,
      preconditions: input.preconditions,
      given: input.given,
      when: input.when,
      then: input.then,
      status: input.status,
      priority: input.priority,
      notes: input.notes,
      executedAt: input.executedAt ?? null,
      executedBy: input.executedBy ?? null,
      assignedTo: input.assignedTo ?? null,
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
  const parsed = updateTestCaseSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)
  const fields = parsed.data
  const row = await prisma.testCase.update({
    where: { id },
    data: {
      ...(fields.title !== undefined ? { title: fields.title } : {}),
      ...(fields.userStoryId !== undefined ? { userStoryId: fields.userStoryId } : {}),
      ...(fields.preconditions !== undefined ? { preconditions: fields.preconditions } : {}),
      ...(fields.given !== undefined ? { given: fields.given } : {}),
      ...(fields.when !== undefined ? { when: fields.when } : {}),
      ...(fields.then !== undefined ? { then: fields.then } : {}),
      ...(fields.status !== undefined ? { status: fields.status } : {}),
      ...(fields.priority !== undefined ? { priority: fields.priority } : {}),
      ...(fields.notes !== undefined ? { notes: fields.notes } : {}),
      ...(fields.assignedTo !== undefined ? { assignedTo: fields.assignedTo } : {}),
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
  const parsed = executeTestCaseSchema.safeParse({ status, executedBy, notes })
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)
  const existing = await prisma.testCase.findUnique({ where: { id }, select: { projectId: true } })
  if (!existing) return undefined
  await assertProjectAccess(userId, existing.projectId)
  const row = await prisma.testCase.update({
    where: { id },
    data: {
      status: parsed.data.status,
      notes: parsed.data.notes,
      executedBy: parsed.data.executedBy,
      executedAt: new Date(),
    },
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
