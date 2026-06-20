// RQA-Tracer Types

export type ProjectStatus = 'active' | 'archived' | 'completed'
export type UserStoryStatus = 'backlog' | 'in-progress' | 'testing' | 'done'
export type UserStoryPriority = 'low' | 'medium' | 'high' | 'critical'
export type TestCaseStatus = 'pending' | 'passed' | 'failed' | 'blocked'
export type TestCasePriority = 'low' | 'medium' | 'high'

export interface Project {
  id: string
  name: string
  description: string
  status: ProjectStatus
  createdAt: Date
  updatedAt: Date
}

export interface Module {
  id: string
  projectId: string
  name: string
  description: string
  order: number
  createdAt: Date
}

export interface UserStory {
  id: string
  projectId: string
  moduleId: string | null
  code: string // e.g., "US-001"
  title: string
  asA: string // Como [rol]
  iWant: string // Quiero [acción]
  soThat: string // Para [beneficio]
  status: UserStoryStatus
  priority: UserStoryPriority
  acceptanceCriteria: AcceptanceCriterion[]
  assignedTo: string | null // user_id
  createdAt: Date
  updatedAt: Date
}

export interface AcceptanceCriterion {
  id: string
  userStoryId: string
  description: string
  order: number
}

export interface TestCase {
  id: string
  projectId: string
  userStoryId: string
  code: string // e.g., "TC-001"
  title: string
  preconditions: string
  // Gherkin format
  given: string
  when: string
  then: string
  status: TestCaseStatus
  priority: TestCasePriority
  executedAt: Date | null
  executedBy: string | null
  notes: string
  assignedTo: string | null // user_id
  createdAt: Date
  updatedAt: Date
}

// Dashboard stats
export interface DashboardStats {
  totalProjects: number
  totalUserStories: number
  totalTestCases: number
  userStoriesByStatus: Record<UserStoryStatus, number>
  testCasesByStatus: Record<TestCaseStatus, number>
  coveragePercentage: number // % of US with at least 1 TC
}

// Traceability matrix row
export interface TraceabilityRow {
  userStory: UserStory
  testCases: TestCase[]
  coverage: 'none' | 'partial' | 'full'
  canComplete: boolean // Has at least 1 passed TC
}

// Collaboration
export type MemberRole = 'owner' | 'editor' | 'viewer'

export interface ProjectMember {
  id: string
  projectId: string
  userId: string
  role: MemberRole
  nombre: string
  joinedAt: Date
}
