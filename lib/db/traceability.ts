'use server'

import { prisma } from '@/lib/prisma'
import type { TraceabilityRow } from '@/lib/types'
import { toUserStory, toTestCase, groupBy } from './mappers'
import { requireUserId, assertProjectAccess, isValidObjectId } from './access'

export async function getTraceabilityMatrix(projectId: string): Promise<TraceabilityRow[]> {
  if (!isValidObjectId(projectId)) return []
  const userId = await requireUserId()
  await assertProjectAccess(userId, projectId)

  const stories = await prisma.userStory.findMany({
    where: { projectId },
    orderBy: { code: 'asc' },
  })
  const storyIds = stories.map((s) => s.id)

  const [criteria, testCases] = await Promise.all([
    storyIds.length
      ? prisma.acceptanceCriterion.findMany({ where: { userStoryId: { in: storyIds } } })
      : Promise.resolve([]),
    prisma.testCase.findMany({ where: { projectId } }),
  ])

  const critByStory = groupBy(criteria, (c) => c.userStoryId)
  const tcByStory = groupBy(testCases, (t) => t.userStoryId)

  return stories.map((s) => {
    const tcs = (tcByStory.get(s.id) ?? []).map(toTestCase)
    const coverage: TraceabilityRow['coverage'] =
      tcs.length === 0 ? 'none' : tcs.every((t) => t.status === 'passed') ? 'full' : 'partial'
    return {
      userStory: toUserStory(s, critByStory.get(s.id) ?? []),
      testCases: tcs,
      coverage,
      canComplete: tcs.some((t) => t.status === 'passed'),
    }
  })
}
