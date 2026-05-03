import { createClient } from '@/lib/supabase/client'

export interface GlobalMessage {
  id: string
  userId: string
  userName: string
  content: string
  createdAt: Date
}

function mapGlobalMessage(row: Record<string, unknown>): GlobalMessage {
  const profile = row.profiles as { nombre: string } | null
  return {
    id: row.id as string,
    userId: row.user_id as string,
    userName: profile?.nombre || 'Usuario',
    content: row.content as string,
    createdAt: new Date(row.created_at as string),
  }
}

export async function getGlobalMessages(): Promise<GlobalMessage[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('global_messages')
    .select('*, profiles(nombre)')
    .order('created_at', { ascending: true })
    .limit(100)
  if (error) throw error
  return (data || []).map(mapGlobalMessage)
}

export async function sendGlobalMessage(content: string): Promise<GlobalMessage> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: row, error } = await supabase
    .from('global_messages')
    .insert({ user_id: user.id, content: content.trim() })
    .select('*, profiles(nombre)')
    .single()
  if (error) throw error
  return mapGlobalMessage(row)
}

export function subscribeToGlobalMessages(
  onMessage: (message: GlobalMessage) => void
) {
  const supabase = createClient()
  const channel = supabase
    .channel('global-chat')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'global_messages' },
      async (payload) => {
        const row = payload.new as Record<string, unknown>
        const { data: profile } = await supabase
          .from('profiles')
          .select('nombre')
          .eq('id', row.user_id as string)
          .single()
        onMessage(mapGlobalMessage({ ...row, profiles: profile }))
      }
    )
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}
