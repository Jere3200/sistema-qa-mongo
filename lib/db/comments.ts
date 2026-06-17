export interface Comment {
  id: string
  userStoryId: string | null
  testCaseId: string | null
  userId: string
  authorName: string
  content: string
  createdAt: Date
}

export async function getComments(_params: { userStoryId?: string; testCaseId?: string }): Promise<Comment[]> {
  return []
}

export async function addComment(_params: {
  userStoryId?: string
  testCaseId?: string
  content: string
}): Promise<Comment> {
  throw new Error('Not connected to database')
}

export async function deleteComment(_id: string): Promise<void> {}
