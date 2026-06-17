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

export async function searchUsers(_query: string): Promise<UserProfile[]> {
  return []
}

export async function getConversations(): Promise<DMConversation[]> {
  return []
}

export async function getDMMessages(_otherUserId: string): Promise<DMMessage[]> {
  return []
}

export async function sendDMMessage(_toUserId: string, _content: string): Promise<DMMessage> {
  throw new Error('Not connected to database')
}

export function subscribeToDMs(
  _userId: string,
  _onMessage: (message: DMMessage) => void
): () => void {
  return () => {}
}
