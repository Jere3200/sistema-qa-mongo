import { createClient } from '@/lib/supabase/client'

export interface DMMessage {
  id: string
  fromUserId: string
  toUserId: string
  fromUserName: string
  content: string
  createdAt: Date
}

export interface DMConversation {
  userId: string
  nombre: string
  lastMessage: string
  lastAt: Date
}

export interface UserProfile {
  id: string
  nombre: string
  email: string
}

function mapMessage(row: Record<string, unknown>): DMMessage {
  const profile = row.profiles as { nombre: string } | null
  return {
    id: row.id as string,
    fromUserId: row.from_user_id as string,
    toUserId: row.to_user_id as string,
    fromUserName: profile?.nombre || 'Usuario',
    content: row.content as string,
    createdAt: new Date(row.created_at as string),
  }
}

export async function searchUsers(query: string): Promise<UserProfile[]> {
  if (!query.trim()) return []
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, nombre, email')
    .or(`nombre.ilike.%${query}%,email.ilike.%${query}%`)
    .neq('id', user?.id ?? '')
    .limit(10)
  if (error) throw error
  return (data || []) as UserProfile[]
}

export async function getConversations(): Promise<DMConversation[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('direct_messages')
    .select('from_user_id, to_user_id, content, created_at')
    .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
  if (error) throw error

  const seen = new Map<string, DMConversation>()
  for (const row of data || []) {
    const otherId = row.from_user_id === user.id ? row.to_user_id : row.from_user_id
    if (!seen.has(otherId)) {
      seen.set(otherId, {
        userId: otherId,
        nombre: '',
        lastMessage: row.content as string,
        lastAt: new Date(row.created_at as string),
      })
    }
  }

  if (seen.size === 0) return []

  const ids = Array.from(seen.keys())
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, nombre')
    .in('id', ids)

  for (const p of profiles || []) {
    const conv = seen.get(p.id)
    if (conv) conv.nombre = p.nombre
  }

  return Array.from(seen.values()).sort((a, b) => b.lastAt.getTime() - a.lastAt.getTime())
}

export async function getDMMessages(otherUserId: string): Promise<DMMessage[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('direct_messages')
    .select('*, profiles!from_user_id(nombre)')
    .or(
      `and(from_user_id.eq.${user.id},to_user_id.eq.${otherUserId}),` +
      `and(from_user_id.eq.${otherUserId},to_user_id.eq.${user.id})`
    )
    .order('created_at', { ascending: true })
    .limit(100)
  if (error) throw error
  return (data || []).map(mapMessage)
}

export async function sendDMMessage(toUserId: string, content: string): Promise<DMMessage> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: row, error } = await supabase
    .from('direct_messages')
    .insert({ from_user_id: user.id, to_user_id: toUserId, content: content.trim() })
    .select('*, profiles!from_user_id(nombre)')
    .single()
  if (error) throw error
  return mapMessage(row)
}

export function subscribeToDMs(
  myUserId: string,
  onMessage: (msg: DMMessage) => void
) {
  const supabase = createClient()
  const channel = supabase
    .channel(`dm:${myUserId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'direct_messages',
        filter: `to_user_id=eq.${myUserId}`,
      },
      async (payload) => {
        const row = payload.new as Record<string, unknown>
        const { data: profile } = await supabase
          .from('profiles')
          .select('nombre')
          .eq('id', row.from_user_id as string)
          .single()
        onMessage(mapMessage({ ...row, profiles: profile }))
      }
    )
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}
