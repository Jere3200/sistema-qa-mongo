import type { TestCase, TestCaseStatus } from '@/lib/types'

export async function getTestCases(_projectId: string): Promise<TestCase[]> {
  return []
}

export async function getTestCasesByUserStory(_userStoryId: string): Promise<TestCase[]> {
  return []
}

export async function getTestCase(_id: string): Promise<TestCase | undefined> {
  return undefined
}

export async function createTestCase(
  _data: Omit<TestCase, 'id' | 'code' | 'createdAt' | 'updatedAt'>
): Promise<TestCase> {
  throw new Error('Not connected to database')
}

export async function updateTestCase(_id: string, _data: Partial<TestCase>): Promise<TestCase | undefined> {
  return undefined
}

export async function executeTestCase(
  _id: string,
  _status: TestCaseStatus,
  _executedBy: string,
  _notes: string
): Promise<TestCase | undefined> {
  return undefined
}

export async function deleteTestCase(_id: string): Promise<boolean> {
  return false
}
