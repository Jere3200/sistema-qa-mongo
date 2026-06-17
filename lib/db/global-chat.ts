export interface GlobalMessage {
  id: string
  userId: string
  userName: string
  content: string
  createdAt: Date
}

export async function getGlobalMessages(): Promise<GlobalMessage[]> {
  return []
}

export async function sendGlobalMessage(_content: string): Promise<GlobalMessage> {
  throw new Error('Not connected to database')
}

export function subscribeToGlobalMessages(
  _onMessage: (message: GlobalMessage) => void
): () => void {
  return () => {}
}
