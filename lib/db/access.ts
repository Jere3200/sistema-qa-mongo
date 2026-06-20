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

/** Verifica acceso al proyecto dueño de una historia. Lanza si no corresponde. */
export async function assertStoryAccess(userId: string, storyId: string): Promise<void> {
  if (!isValidObjectId(storyId)) throw new Error('No autorizado')
  const story = await prisma.userStory.findUnique({
    where: { id: storyId },
    select: { projectId: true },
  })
  if (!story) throw new Error('No autorizado')
  await assertProjectAccess(userId, story.projectId)
}

/** Verifica acceso al proyecto dueño de un caso de prueba. Lanza si no corresponde. */
export async function assertTestCaseAccess(userId: string, testCaseId: string): Promise<void> {
  if (!isValidObjectId(testCaseId)) throw new Error('No autorizado')
  const testCase = await prisma.testCase.findUnique({
    where: { id: testCaseId },
    select: { projectId: true },
  })
  if (!testCase) throw new Error('No autorizado')
  await assertProjectAccess(userId, testCase.projectId)
}

/** Resuelve nombres visibles para una lista de userIds (name → email → "Usuario"). */
export async function getUserNameMap(userIds: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(userIds)]
  if (unique.length === 0) return new Map()
  const users = await prisma.user.findMany({
    where: { id: { in: unique } },
    select: { id: true, name: true, email: true },
  })
  return new Map(users.map((u) => [u.id, u.name ?? u.email ?? 'Usuario']))
}
