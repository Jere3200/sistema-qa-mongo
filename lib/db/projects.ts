import { createClient } from '@/lib/supabase/client'
import type { Project } from '@/lib/types'

function mapProject(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) || '',
    status: row.status as Project['status'],
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  }
}

export async function getProjects(): Promise<Project[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(mapProject)
}

export async function getProject(id: string): Promise<Project | undefined> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return undefined
  return mapProject(data)
}

export async function createProject(
  data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Project> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: row, error } = await supabase
    .from('projects')
    .insert({ name: data.name, description: data.description, status: data.status, owner_id: user.id })
    .select()
    .single()
  if (error) throw error
  return mapProject(row)
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project | undefined> {
  const supabase = createClient()
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (data.name !== undefined) updates.name = data.name
  if (data.description !== undefined) updates.description = data.description
  if (data.status !== undefined) updates.status = data.status

  const { data: row, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error || !row) return undefined
  return mapProject(row)
}

export async function deleteProject(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from('projects').delete().eq('id', id)
  return !error
}

export interface ProjectMember {
  id: string
  projectId: string
  userId: string
  role: 'owner' | 'editor' | 'viewer'
  nombre: string
  joinedAt: Date
}

export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
  const supabase = createClient()

  const { data: members, error } = await supabase
    .from('project_members')
    .select('id, project_id, user_id, role, joined_at')
    .eq('project_id', projectId)
  if (error) throw error
  if (!members || members.length === 0) return []

  const userIds = members.map((m) => m.user_id)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, nombre')
    .in('id', userIds)

  const profileMap = new Map((profiles || []).map((p) => [p.id, p]))

  return members.map((row) => {
    const profile = profileMap.get(row.user_id)
    return {
      id: row.id,
      projectId: row.project_id,
      userId: row.user_id,
      role: row.role as ProjectMember['role'],
      nombre: profile?.nombre || '',
      joinedAt: new Date(row.joined_at),
    }
  })
}

export async function inviteMember(projectId: string, email: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .single()
  if (profileError || !profile) throw new Error(
    'No se pudo procesar la invitación. Verificá que el email sea correcto.'
  )

  const { error } = await supabase
    .from('project_members')
    .insert({ project_id: projectId, user_id: profile.id, role: 'editor', invited_by: user.id })
  if (error) {
    if (error.code === '23505') throw new Error('Ese usuario ya es miembro del proyecto')
    throw error
  }
}

export async function removeMember(projectId: string, userId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: project } = await supabase
    .from('projects')
    .select('owner_id')
    .eq('id', projectId)
    .single()
  if (!project || project.owner_id !== user.id) throw new Error('Solo el owner puede eliminar miembros')

  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('user_id', userId)
  if (error) throw error
}

export async function getProjectOwnerId(projectId: string): Promise<string | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('projects')
    .select('owner_id')
    .eq('id', projectId)
    .single()
  return data?.owner_id || null
}
