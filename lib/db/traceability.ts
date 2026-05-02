import { createClient } from '@/lib/supabase/client'
import type { TraceabilityRow } from '@/lib/types'
import { getUserStories } from './stories'
import { getTestCases } from './test-cases'

export async function getTraceabilityMatrix(projectId: string): Promise<TraceabilityRow[]> {
  const [stories, testCases] = await Promise.all([
    getUserStories(projectId),
    getTestCases(projectId),
  ])

  return stories.map((story) => {
    const storyTCs = testCases.filter((tc) => tc.userStoryId === story.id)
    const hasPassed = storyTCs.some((tc) => tc.status === 'passed')

    let coverage: TraceabilityRow['coverage'] = 'none'
    if (storyTCs.length > 0) {
      coverage = storyTCs.every((tc) => tc.status === 'passed') ? 'full' : 'partial'
    }

    return {
      userStory: story,
      testCases: storyTCs,
      coverage,
      canComplete: hasPassed,
    }
  })
}
