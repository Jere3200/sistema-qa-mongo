import { createClient } from '@/lib/supabase/client'
import type { TestCase, TestCaseStatus } from '@/lib/types'

function mapTestCase(row: Record<string, unknown>): TestCase {
  return {
    id: row.id as string,
    projectId: row.project_id as string,
    userStoryId: row.user_story_id as string,
    code: row.code as string,
    title: row.title as string,
    preconditions: (row.preconditions as string) || '',
    given: (row.given_step as string) || '',
    when: (row.when_step as string) || '',
    then: (row.then_step as string) || '',
    status: row.status as TestCase['status'],
    priority: row.priority as TestCase['priority'],
    executedAt: row.executed_at ? new Date(row.executed_at as string) : null,
    executedBy: (row.executed_by as string) || null,
    notes: (row.notes as string) || '',
    assignedTo: (row.assigned_to as string) || null,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  }
}

export async function getTestCases(projectId: string): Promise<TestCase[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('test_cases')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data || []).map(mapTestCase)
}

export async function getTestCasesByUserStory(userStoryId: string): Promise<TestCase[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('test_cases')
    .select('*')
    .eq('user_story_id', userStoryId)
  if (error) throw error
  return (data || []).map(mapTestCase)
}

export async function getTestCase(id: string): Promise<TestCase | undefined> {
  const supabase = createClient()
  const { data, error } = await supabase.from('test_cases').select('*').eq('id', id).single()
  if (error || !data) return undefined
  return mapTestCase(data)
}

export async function createTestCase(
  data: Omit<TestCase, 'id' | 'code' | 'createdAt' | 'updatedAt'>
): Promise<TestCase> {
  const supabase = createClient()
  const { data: row, error } = await supabase
    .from('test_cases')
    .insert({
      project_id: data.projectId,
      user_story_id: data.userStoryId,
      title: data.title,
      preconditions: data.preconditions,
      given_step: data.given,
      when_step: data.when,
      then_step: data.then,
      status: data.status,
      priority: data.priority,
      executed_at: data.executedAt?.toISOString() || null,
      executed_by: data.executedBy || null,
      notes: data.notes,
    })
    .select()
    .single()
  if (error) throw error
  return mapTestCase(row)
}

export async function updateTestCase(id: string, data: Partial<TestCase>): Promise<TestCase | undefined> {
  const supabase = createClient()
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (data.title !== undefined) updates.title = data.title
  if (data.preconditions !== undefined) updates.preconditions = data.preconditions
  if (data.given !== undefined) updates.given_step = data.given
  if (data.when !== undefined) updates.when_step = data.when
  if (data.then !== undefined) updates.then_step = data.then
  if (data.status !== undefined) updates.status = data.status
  if (data.priority !== undefined) updates.priority = data.priority
  if (data.executedAt !== undefined) updates.executed_at = data.executedAt?.toISOString() || null
  if (data.executedBy !== undefined) updates.executed_by = data.executedBy
  if (data.notes !== undefined) updates.notes = data.notes
  if (data.assignedTo !== undefined) updates.assigned_to = data.assignedTo || null

  const { data: row, error } = await supabase
    .from('test_cases')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error || !row) return undefined
  return mapTestCase(row)
}

export async function executeTestCase(
  id: string,
  status: TestCaseStatus,
  executedBy: string,
  notes?: string
): Promise<TestCase | undefined> {
  return updateTestCase(id, {
    status,
    executedBy,
    executedAt: new Date(),
    notes: notes || '',
  })
}

export async function deleteTestCase(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from('test_cases').delete().eq('id', id)
  return !error
}
