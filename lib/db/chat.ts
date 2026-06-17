export interface ChatMessage {
  id: string
  projectId: string
  userId: string
  userName: string
  content: string
  createdAt: Date
}

export async function getMessages(_projectId: string): Promise<ChatMessage[]> {
  return []
}

export async function sendMessage(_projectId: string, _content: string): Promise<ChatMessage> {
  throw new Error('Not connected to database')
}

export function subscribeToMessages(
  _projectId: string,
  _onMessage: (message: ChatMessage) => void
): () => void {
  return () => {}
}
