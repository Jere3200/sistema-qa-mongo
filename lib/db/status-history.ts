export interface StatusHistoryEntry {
  id: string
  storyId: string
  oldStatus: string
  newStatus: string
  changedBy: string
  authorName: string
  changedAt: Date
}

export async function getStatusHistory(_storyId: string): Promise<StatusHistoryEntry[]> {
  return []
}

export async function logStatusChange(_params: {
  storyId: string
  oldStatus: string
  newStatus: string
}): Promise<void> {}
