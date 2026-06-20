import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/i

export function isValidObjectId(id: string): boolean {
  return OBJECT_ID_REGEX.test(id)
}

export async function getSessionUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}

export async function requireUserId(): Promise<string> {
  const id = await getSessionUserId()
  if (!id) throw new Error('No autorizado')
  return id
}

/** Ids de proyectos que el usuario posee o de los que es miembro. */
export async function getAccessibleProjectIds(userId: string): Promise<string[]> {
  const [owned, memberships] = await Promise.all([
    prisma.project.findMany({ where: { ownerId: userId }, select: { id: true } }),
    prisma.projectMember.findMany({ where: { userId }, select: { projectId: true } }),
  ])
  const ids = new Set<string>()
  owned.forEach((p) => ids.add(p.id))
  memberships.forEach((m) => ids.add(m.projectId))
  return [...ids]
}

export async function userCanAccessProject(userId: string, projectId: string): Promise<boolean> {
  if (!isValidObjectId(projectId)) return false
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  })
  if (!project) return false
  if (project.ownerId === userId) return true
  const member = await prisma.projectMember.findFirst({
    where: { projectId, userId },
    select: { id: true },
  })
  return Boolean(member)
}

export async function assertProjectAccess(userId: string, projectId: string): Promise<void> {
  const allowed = await userCanAccessProject(userId, projectId)
  if (!allowed) throw new Error('No autorizado')
}

export async function isProjectOwner(userId: string, projectId: string): Promise<boolean> {
  if (!isValidObjectId(projectId)) return false
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  })
  return project?.ownerId === userId
}
