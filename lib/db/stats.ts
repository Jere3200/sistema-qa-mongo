import { createClient } from '@/lib/supabase/client'
import type { DashboardStats, UserStoryStatus, TestCaseStatus } from '@/lib/types'

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createClient()

  const [{ data: stories }, { data: testCases }, { count: totalProjects }] = await Promise.all([
    supabase.from('user_stories').select('status, project_id'),
    supabase.from('test_cases').select('status, user_story_id'),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'active'),
  ])

  const userStoriesByStatus: Record<UserStoryStatus, number> = {
    backlog: 0,
    'in-progress': 0,
    testing: 0,
    done: 0,
  }
  ;(stories || []).forEach((s) => {
    const key = s.status as UserStoryStatus
    if (key in userStoriesByStatus) userStoriesByStatus[key]++
  })

  const testCasesByStatus: Record<TestCaseStatus, number> = {
    pending: 0,
    passed: 0,
    failed: 0,
    blocked: 0,
  }
  ;(testCases || []).forEach((t) => {
    const key = t.status as TestCaseStatus
    if (key in testCasesByStatus) testCasesByStatus[key]++
  })

  const storiesWithTC = new Set((testCases || []).map((t) => t.user_story_id)).size
  const totalUserStories = (stories || []).length
  const coveragePercentage = totalUserStories > 0
    ? Math.round((storiesWithTC / totalUserStories) * 100)
    : 0

  return {
    totalProjects: totalProjects || 0,
    totalUserStories,
    totalTestCases: (testCases || []).length,
    userStoriesByStatus,
    testCasesByStatus,
    coveragePercentage,
  }
}
