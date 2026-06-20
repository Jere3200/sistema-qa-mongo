'use server'

import { prisma } from '@/lib/prisma'
import type { DashboardStats } from '@/lib/types'
import { getSessionUserId, getAccessibleProjectIds } from './access'

function emptyStats(): DashboardStats {
  return {
    totalProjects: 0,
    totalUserStories: 0,
    totalTestCases: 0,
    userStoriesByStatus: { backlog: 0, 'in-progress': 0, testing: 0, done: 0 },
    testCasesByStatus: { pending: 0, passed: 0, failed: 0, blocked: 0 },
    coveragePercentage: 0,
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const userId = await getSessionUserId()
  if (!userId) return emptyStats()

  const projectIds = await getAccessibleProjectIds(userId)
  if (projectIds.length === 0) return emptyStats()

  const [projects, stories, testCases] = await Promise.all([
    prisma.project.findMany({ where: { id: { in: projectIds } }, select: { status: true } }),
    prisma.userStory.findMany({
      where: { projectId: { in: projectIds } },
      select: { id: true, status: true },
    }),
    prisma.testCase.findMany({
      where: { projectId: { in: projectIds } },
      select: { status: true, userStoryId: true },
    }),
  ])

  const stats = emptyStats()
  stats.totalProjects = projects.filter((p) => p.status === 'active').length
  stats.totalUserStories = stories.length
  stats.totalTestCases = testCases.length

  for (const s of stories) {
    if (s.status in stats.userStoriesByStatus) {
      stats.userStoriesByStatus[s.status as keyof DashboardStats['userStoriesByStatus']] += 1
    }
  }
  for (const t of testCases) {
    if (t.status in stats.testCasesByStatus) {
      stats.testCasesByStatus[t.status as keyof DashboardStats['testCasesByStatus']] += 1
    }
  }

  const storiesWithTests = new Set(testCases.map((t) => t.userStoryId))
  const covered = stories.filter((s) => storiesWithTests.has(s.id)).length
  stats.coveragePercentage =
    stories.length > 0 ? Math.round((covered / stories.length) * 100) : 0

  return stats
}
