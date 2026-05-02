import { createClient } from '@/lib/supabase/client'
import type { Module } from '@/lib/types'

function mapModule(row: Record<string, unknown>): Module {
  return {
    id: row.id as string,
    projectId: row.project_id as string,
    name: row.name as string,
    description: (row.description as string) || '',
    order: (row.order as number) || 0,
    createdAt: new Date(row.created_at as string),
  }
}

export async function getModules(projectId: string): Promise<Module[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('modules')
    .select('*')
    .eq('project_id', projectId)
    .order('order', { ascending: true })
  if (error) throw error
  return (data || []).map(mapModule)
}

export async function getModule(id: string): Promise<Module | undefined> {
  const supabase = createClient()
  const { data, error } = await supabase.from('modules').select('*').eq('id', id).single()
  if (error || !data) return undefined
  return mapModule(data)
}

export async function createModule(data: Omit<Module, 'id' | 'createdAt'>): Promise<Module> {
  const supabase = createClient()
  const existing = await getModules(data.projectId)
  const maxOrder = existing.reduce((max, m) => Math.max(max, m.order), 0)

  const { data: row, error } = await supabase
    .from('modules')
    .insert({ project_id: data.projectId, name: data.name, description: data.description, order: maxOrder + 1 })
    .select()
    .single()
  if (error) throw error
  return mapModule(row)
}

export async function updateModule(id: string, data: Partial<Module>): Promise<Module | undefined> {
  const supabase = createClient()
  const updates: Record<string, unknown> = {}
  if (data.name !== undefined) updates.name = data.name
  if (data.description !== undefined) updates.description = data.description
  if (data.order !== undefined) updates.order = data.order

  const { data: row, error } = await supabase
    .from('modules')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error || !row) return undefined
  return mapModule(row)
}

export async function deleteModule(id: string): Promise<boolean> {
  const supabase = createClient()
  await supabase.from('user_stories').update({ module_id: null }).eq('module_id', id)
  const { error } = await supabase.from('modules').delete().eq('id', id)
  return !error
}
