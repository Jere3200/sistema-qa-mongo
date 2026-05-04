import { createClient } from '@/lib/supabase/client'

export interface Comment {
  id: string
  userStoryId: string | null
  testCaseId: string | null
  userId: string
  authorName: string
  content: string
  createdAt: Date
}

export async function getComments(params: { userStoryId?: string; testCaseId?: string }): Promise<Comment[]> {
  const supabase = createClient()
  let query = supabase
    .from('comments')
    .select('id, user_story_id, test_case_id, user_id, content, created_at')
    .order('created_at', { ascending: true })

  if (params.userStoryId) query = query.eq('user_story_id', params.userStoryId)
  if (params.testCaseId) query = query.eq('test_case_id', params.testCaseId)

  const { data, error } = await query
  if (error) throw error
  if (!data || data.length === 0) return []

  const userIds = [...new Set(data.map((r) => r.user_id as string))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, nombre')
    .in('id', userIds)
  const profileMap = new Map((profiles || []).map((p) => [p.id, p.nombre as string]))

  return data.map((row) => ({
    id: row.id as string,
    userStoryId: (row.user_story_id as string) || null,
    testCaseId: (row.test_case_id as string) || null,
    userId: row.user_id as string,
    authorName: profileMap.get(row.user_id as string) ?? 'Usuario',
    content: row.content as string,
    createdAt: new Date(row.created_at as string),
  }))
}

export async function addComment(params: {
  userStoryId?: string
  testCaseId?: string
  content: string
}): Promise<Comment> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('comments')
    .insert({
      user_story_id: params.userStoryId ?? null,
      test_case_id: params.testCaseId ?? null,
      user_id: user.id,
      content: params.content.trim(),
    })
    .select('id, user_story_id, test_case_id, user_id, content, created_at')
    .single()
  if (error) throw error

  const { data: profile } = await supabase
    .from('profiles')
    .select('nombre')
    .eq('id', user.id)
    .single()

  return {
    id: data.id as string,
    userStoryId: (data.user_story_id as string) || null,
    testCaseId: (data.test_case_id as string) || null,
    userId: data.user_id as string,
    authorName: (profile?.nombre as string) ?? 'Usuario',
    content: data.content as string,
    createdAt: new Date(data.created_at as string),
  }
}

export async function deleteComment(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('comments').delete().eq('id', id)
  if (error) throw error
}
