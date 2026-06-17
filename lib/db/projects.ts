import type { Project } from '@/lib/types'

export async function getProjects(): Promise<Project[]> {
  return []
}

export async function getProject(_id: string): Promise<Project | undefined> {
  return undefined
}

export async function createProject(
  _data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Project> {
  throw new Error('Not connected to database')
}

export async function updateProject(_id: string, _data: Partial<Project>): Promise<Project | undefined> {
  return undefined
}

export async function deleteProject(_id: string): Promise<boolean> {
  return false
}

export interface ProjectMember {
  id: string
  projectId: string
  userId: string
  role: 'owner' | 'editor' | 'viewer'
  nombre: string
  joinedAt: Date
}

export async function getProjectMembers(_projectId: string): Promise<ProjectMember[]> {
  return []
}

export async function inviteMember(_projectId: string, _email: string): Promise<void> {}

export async function removeMember(_projectId: string, _userId: string): Promise<void> {}

export async function getProjectOwnerId(_projectId: string): Promise<string | null> {
  return null
}
