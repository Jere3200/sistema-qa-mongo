import { createClient } from '@/lib/supabase/client'

export interface ChatMessage {
  id: string
  projectId: string
  userId: string
  userName: string
  content: string
  createdAt: Date
}

function mapMessage(row: Record<string, unknown>): ChatMessage {
  const profile = row.profiles as { nombre: string } | null
  return {
    id: row.id as string,
    projectId: row.project_id as string,
    userId: row.user_id as string,
    userName: profile?.nombre || 'Usuario',
    content: row.content as string,
    createdAt: new Date(row.created_at as string),
  }
}

export async function getMessages(projectId: string): Promise<ChatMessage[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*, profiles(nombre)')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })
    .limit(100)
  if (error) throw error
  return (data || []).map(mapMessage)
}

const MAX_MESSAGE_LENGTH = 2000

export async function sendMessage(projectId: string, content: string): Promise<ChatMessage> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const sanitized = content.trim().slice(0, MAX_MESSAGE_LENGTH)
  if (!sanitized) throw new Error('El mensaje no puede estar vacío')

  const { data: row, error } = await supabase
    .from('chat_messages')
    .insert({ project_id: projectId, user_id: user.id, content: sanitized })
    .select('*, profiles(nombre)')
    .single()
  if (error) throw error
  return mapMessage(row)
}

export function subscribeToMessages(
  projectId: string,
  onMessage: (message: ChatMessage) => void
) {
  const supabase = createClient()
  const channel = supabase
    .channel(`chat:${projectId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `project_id=eq.${projectId}` },
      async (payload) => {
        const row = payload.new as Record<string, unknown>
        const { data: profile } = await supabase
          .from('profiles')
          .select('nombre')
          .eq('id', row.user_id as string)
          .single()
        onMessage(mapMessage({ ...row, profiles: profile }))
      }
    )
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}
