import type { UserStory, AcceptanceCriterion } from '@/lib/types'

export async function getUserStories(_projectId: string): Promise<UserStory[]> {
  return []
}

export async function getUserStoriesByModule(_moduleId: string): Promise<UserStory[]> {
  return []
}

export async function getUserStory(_id: string): Promise<UserStory | undefined> {
  return undefined
}

export async function createUserStory(
  _data: Omit<UserStory, 'id' | 'code' | 'acceptanceCriteria' | 'createdAt' | 'updatedAt'>
): Promise<UserStory> {
  throw new Error('Not connected to database')
}

export async function updateUserStory(_id: string, _data: Partial<UserStory>): Promise<UserStory | undefined> {
  return undefined
}

export async function deleteUserStory(_id: string): Promise<boolean> {
  return false
}

export async function addAcceptanceCriterion(
  _userStoryId: string,
  _description: string
): Promise<AcceptanceCriterion> {
  throw new Error('Not connected to database')
}

export async function removeAcceptanceCriterion(_id: string): Promise<void> {}

export async function replaceAcceptanceCriteria(
  _userStoryId: string,
  _descriptions: string[]
): Promise<AcceptanceCriterion[]> {
  return []
}
