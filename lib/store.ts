// Re-exports from Supabase data layer
// All functions are async — callers must await or use .then()

export {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectMembers,
  inviteMember,
  removeMember,
  getProjectOwnerId,
} from './db/projects'

export {
  getModules,
  getModule,
  createModule,
  updateModule,
  deleteModule,
} from './db/modules'

export {
  getUserStories,
  getUserStoriesByModule,
  getUserStory,
  createUserStory,
  updateUserStory,
  deleteUserStory,
  addAcceptanceCriterion,
  removeAcceptanceCriterion,
  replaceAcceptanceCriteria,
} from './db/stories'

export {
  getTestCases,
  getTestCasesByUserStory,
  getTestCase,
  createTestCase,
  updateTestCase,
  executeTestCase,
  deleteTestCase,
} from './db/test-cases'

export { getDashboardStats } from './db/stats'
export { getTraceabilityMatrix } from './db/traceability'
export { getMessages, sendMessage } from './db/chat'
export { getGlobalMessages, sendGlobalMessage } from './db/global-chat'
export { getComments, addComment, deleteComment } from './db/comments'
export { getStatusHistory } from './db/status-history'
