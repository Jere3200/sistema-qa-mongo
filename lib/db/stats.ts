import type { DashboardStats } from '@/lib/types'

export async function getDashboardStats(): Promise<DashboardStats> {
  return {
    totalProjects: 0,
    totalUserStories: 0,
    totalTestCases: 0,
    userStoriesByStatus: { backlog: 0, 'in-progress': 0, testing: 0, done: 0 },
    testCasesByStatus: { pending: 0, passed: 0, failed: 0, blocked: 0 },
    coveragePercentage: 0,
  }
}
