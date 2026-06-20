'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { Project, ProjectMember, MemberRole } from '@/lib/types'
import { toProject } from './mappers'
import {
  requireUserId,
  getAccessibleProjectIds,
  userCanAccessProject,
  assertProjectAccess,
  isProjectOwner,
  isValidObjectId,
} from './access'

export async function getProjects(): Promise<Project[]> {
  const userId = await requireUserId()
  const ids = await getAccessibleProjectIds(userId)
  if (ids.length === 0) return []
  const rows = await prisma.project.findMany({
    where: { id: { in: ids } },
    orderBy: { updatedAt: 'desc' },
  })
  return rows.map(toProject)
}

export async function getProject(id: string): Promise<Project | undefined> {
  if (!isValidObjectId(id)) return undefined
  const userId = await requireUserId()
  const allowed = await userCanAccessProject(userId, id)
  if (!allowed) return undefined
  const row = await prisma.project.findUnique({ where: { id } })
  return row ? toProject(row) : undefined
}

export async function createProject(
  data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Project> {
  const userId = await requireUserId()
  const row = await prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      status: data.status,
      ownerId: userId,
    },
  })
  await prisma.projectMember.create({
    data: { projectId: row.id, userId, role: 'owner' },
  })
  revalidatePath('/proyectos')
  revalidatePath('/dashboard')
  return toProject(row)
}

export async function updateProject(
  id: string,
  data: Partial<Project>
): Promise<Project | undefined> {
  if (!isValidObjectId(id)) return undefined
  const userId = await requireUserId()
  await assertProjectAccess(userId, id)
  const row = await prisma.project.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
    },
  })
  revalidatePath('/proyectos')
  revalidatePath('/dashboard')
  revalidatePath(`/proyectos/${id}`)
  return toProject(row)
}

export async function deleteProject(id: string): Promise<boolean> {
  if (!isValidObjectId(id)) return false
  const userId = await requireUserId()
  const owner = await isProjectOwner(userId, id)
  if (!owner) throw new Error('Solo el propietario puede eliminar el proyecto')

  const stories = await prisma.userStory.findMany({
    where: { projectId: id },
    select: { id: true },
  })
  const storyIds = stories.map((s) => s.id)

  await prisma.acceptanceCriterion.deleteMany({ where: { userStoryId: { in: storyIds } } })
  await prisma.comment.deleteMany({ where: { userStoryId: { in: storyIds } } })
  await prisma.statusHistory.deleteMany({ where: { storyId: { in: storyIds } } })
  await prisma.testCase.deleteMany({ where: { projectId: id } })
  await prisma.userStory.deleteMany({ where: { projectId: id } })
  await prisma.module.deleteMany({ where: { projectId: id } })
  await prisma.projectMessage.deleteMany({ where: { projectId: id } })
  await prisma.projectMember.deleteMany({ where: { projectId: id } })
  await prisma.projectInvitation.deleteMany({ where: { projectId: id } })
  await prisma.project.delete({ where: { id } })

  revalidatePath('/proyectos')
  revalidatePath('/dashboard')
  return true
}

export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
  if (!isValidObjectId(projectId)) return []
  const userId = await requireUserId()
  const allowed = await userCanAccessProject(userId, projectId)
  if (!allowed) return []

  const members = await prisma.projectMember.findMany({
    where: { projectId },
    orderBy: { joinedAt: 'asc' },
  })
  const users = await prisma.user.findMany({
    where: { id: { in: members.map((m) => m.userId) } },
    select: { id: true, name: true, email: true },
  })
  const nameById = new Map(users.map((u) => [u.id, u.name ?? u.email ?? 'Usuario']))

  return members.map((m) => ({
    id: m.id,
    projectId: m.projectId,
    userId: m.userId,
    role: m.role as MemberRole,
    nombre: nameById.get(m.userId) ?? 'Usuario',
    joinedAt: m.joinedAt,
  }))
}

export async function inviteMember(projectId: string, email: string): Promise<void> {
  if (!isValidObjectId(projectId)) throw new Error('Proyecto inválido')
  const userId = await requireUserId()
  const owner = await isProjectOwner(userId, projectId)
  if (!owner) throw new Error('Solo el propietario puede invitar colaboradores')

  const normalized = email.toLowerCase().trim()
  const invited = await prisma.user.findUnique({
    where: { email: normalized },
    select: { id: true },
  })

  if (invited) {
    await prisma.projectMember.upsert({
      where: { projectId_userId: { projectId, userId: invited.id } },
      update: {},
      create: { projectId, userId: invited.id, role: 'editor' },
    })
  } else {
    await prisma.projectInvitation.create({ data: { projectId, email: normalized } })
  }
  revalidatePath(`/proyectos/${projectId}`)
}

export async function removeMember(projectId: string, memberUserId: string): Promise<void> {
  if (!isValidObjectId(projectId)) return
  const userId = await requireUserId()
  const owner = await isProjectOwner(userId, projectId)
  if (!owner) throw new Error('Solo el propietario puede remover colaboradores')
  if (memberUserId === userId) throw new Error('El propietario no puede removerse a sí mismo')

  await prisma.projectMember.deleteMany({ where: { projectId, userId: memberUserId } })
  revalidatePath(`/proyectos/${projectId}`)
}

export async function getProjectOwnerId(projectId: string): Promise<string | null> {
  if (!isValidObjectId(projectId)) return null
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  })
  return project?.ownerId ?? null
}
