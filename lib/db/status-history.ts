import { createClient } from '@/lib/supabase/client'

export interface StatusHistoryEntry {
  id: string
  storyId: string
  oldStatus: string
  newStatus: string
  changedBy: string
  authorName: string
  changedAt: Date
}

export async function getStatusHistory(storyId: string): Promise<StatusHistoryEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('story_status_history')
    .select('id, story_id, old_status, new_status, changed_by, changed_at')
    .eq('story_id', storyId)
    .order('changed_at', { ascending: true })
  if (error) throw error
  if (!data || data.length === 0) return []

  const userIds = [...new Set(data.map((r) => r.changed_by))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, nombre')
    .in('id', userIds)
  const profileMap = new Map((profiles || []).map((p) => [p.id, p.nombre as string]))

  return data.map((row) => ({
    id: row.id as string,
    storyId: row.story_id as string,
    oldStatus: row.old_status as string,
    newStatus: row.new_status as string,
    changedBy: row.changed_by as string,
    authorName: profileMap.get(row.changed_by as string) ?? 'Usuario',
    changedAt: new Date(row.changed_at as string),
  }))
}

export async function logStatusChange(params: {
  storyId: string
  oldStatus: string
  newStatus: string
}): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('story_status_history').insert({
    story_id: params.storyId,
    old_status: params.oldStatus,
    new_status: params.newStatus,
    changed_by: user.id,
  })
}
