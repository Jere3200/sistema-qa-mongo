import { createClient } from '@/lib/supabase/client'
import type { UserStory, AcceptanceCriterion } from '@/lib/types'

function mapCriterion(row: Record<string, unknown>): AcceptanceCriterion {
  return {
    id: row.id as string,
    userStoryId: row.user_story_id as string,
    description: row.description as string,
    order: (row.order as number) || 0,
  }
}

function mapStory(row: Record<string, unknown>): UserStory {
  const criteria = Array.isArray(row.acceptance_criteria)
    ? (row.acceptance_criteria as Record<string, unknown>[]).map(mapCriterion)
    : []
  return {
    id: row.id as string,
    projectId: row.project_id as string,
    moduleId: (row.module_id as string) || null,
    code: row.code as string,
    title: row.title as string,
    asA: (row.as_a as string) || '',
    iWant: (row.i_want as string) || '',
    soThat: (row.so_that as string) || '',
    status: row.status as UserStory['status'],
    priority: row.priority as UserStory['priority'],
    acceptanceCriteria: criteria,
    assignedTo: (row.assigned_to as string) || null,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  }
}

export async function getUserStories(projectId: string): Promise<UserStory[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_stories')
    .select('*, acceptance_criteria(*)')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data || []).map(mapStory)
}

export async function getUserStoriesByModule(moduleId: string): Promise<UserStory[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_stories')
    .select('*, acceptance_criteria(*)')
    .eq('module_id', moduleId)
  if (error) throw error
  return (data || []).map(mapStory)
}

export async function getUserStory(id: string): Promise<UserStory | undefined> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_stories')
    .select('*, acceptance_criteria(*)')
    .eq('id', id)
    .single()
  if (error || !data) return undefined
  return mapStory(data)
}

export async function createUserStory(
  data: Omit<UserStory, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'acceptanceCriteria'>
): Promise<UserStory> {
  const supabase = createClient()
  const { data: row, error } = await supabase
    .from('user_stories')
    .insert({
      project_id: data.projectId,
      module_id: data.moduleId || null,
      title: data.title,
      as_a: data.asA,
      i_want: data.iWant,
      so_that: data.soThat,
      status: data.status,
      priority: data.priority,
    })
    .select('*, acceptance_criteria(*)')
    .single()
  if (error) throw error
  return mapStory(row)
}

export async function updateUserStory(id: string, data: Partial<UserStory>): Promise<UserStory | undefined> {
  const supabase = createClient()

  if (data.status === 'done') {
    const { data: tcs } = await supabase
      .from('test_cases')
      .select('status')
      .eq('user_story_id', id)
    const hasPassed = (tcs || []).some((tc) => tc.status === 'passed')
    if (!hasPassed) throw new Error('No se puede completar una historia sin al menos un caso de prueba aprobado')
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (data.projectId !== undefined) updates.project_id = data.projectId
  if (data.moduleId !== undefined) updates.module_id = data.moduleId || null
  if (data.title !== undefined) updates.title = data.title
  if (data.asA !== undefined) updates.as_a = data.asA
  if (data.iWant !== undefined) updates.i_want = data.iWant
  if (data.soThat !== undefined) updates.so_that = data.soThat
  if (data.status !== undefined) updates.status = data.status
  if (data.priority !== undefined) updates.priority = data.priority
  if (data.assignedTo !== undefined) updates.assigned_to = data.assignedTo || null

  const { data: row, error } = await supabase
    .from('user_stories')
    .update(updates)
    .eq('id', id)
    .select('*, acceptance_criteria(*)')
    .single()
  if (error || !row) return undefined
  return mapStory(row)
}

export async function deleteUserStory(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from('user_stories').delete().eq('id', id)
  return !error
}

export async function addAcceptanceCriterion(
  userStoryId: string,
  description: string
): Promise<UserStory | undefined> {
  const supabase = createClient()
  const { data: existing } = await supabase
    .from('acceptance_criteria')
    .select('order')
    .eq('user_story_id', userStoryId)
    .order('order', { ascending: false })
    .limit(1)

  const nextOrder = existing?.[0] ? (existing[0].order as number) + 1 : 1
  await supabase.from('acceptance_criteria').insert({
    user_story_id: userStoryId,
    description,
    order: nextOrder,
  })
  return getUserStory(userStoryId)
}

export async function removeAcceptanceCriterion(
  userStoryId: string,
  criterionId: string
): Promise<UserStory | undefined> {
  const supabase = createClient()
  await supabase.from('acceptance_criteria').delete().eq('id', criterionId)
  return getUserStory(userStoryId)
}

export async function replaceAcceptanceCriteria(
  userStoryId: string,
  descriptions: string[]
): Promise<void> {
  const supabase = createClient()
  await supabase.from('acceptance_criteria').delete().eq('user_story_id', userStoryId)
  if (descriptions.length > 0) {
    await supabase.from('acceptance_criteria').insert(
      descriptions.map((description, i) => ({ user_story_id: userStoryId, description, order: i + 1 }))
    )
  }
}
