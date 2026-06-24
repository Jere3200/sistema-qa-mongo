import { z } from 'zod'

export const PROJECT_STATUSES = ['active', 'completed', 'archived'] as const
export const STORY_STATUSES = ['backlog', 'in-progress', 'testing', 'done'] as const
export const STORY_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const
export const TEST_STATUSES = ['pending', 'passed', 'failed', 'blocked'] as const
export const TEST_PRIORITIES = ['low', 'medium', 'high'] as const

const requiredName = z.string().trim().min(1, 'El nombre es requerido').max(160, 'Máximo 160 caracteres')
const text = (max: number) => z.string().trim().max(max, `Máximo ${max} caracteres`)

export const createProjectSchema = z.object({
  name: requiredName,
  description: text(2000),
  status: z.enum(PROJECT_STATUSES),
})
export const updateProjectSchema = createProjectSchema.partial()

export const createModuleSchema = z.object({
  projectId: z.string(),
  name: requiredName,
  description: text(1000),
  order: z.number().int().min(0).max(100000),
})
export const updateModuleSchema = createModuleSchema.partial()

export const createUserStorySchema = z.object({
  projectId: z.string(),
  moduleId: z.string().nullable(),
  title: z.string().trim().min(1, 'El título es requerido').max(200, 'Máximo 200 caracteres'),
  asA: text(500),
  iWant: text(1000),
  soThat: text(1000),
  status: z.enum(STORY_STATUSES),
  priority: z.enum(STORY_PRIORITIES),
  assignedTo: z.string().nullable(),
})
export const updateUserStorySchema = createUserStorySchema.partial()

export const createTestCaseSchema = z.object({
  projectId: z.string(),
  userStoryId: z.string(),
  title: z.string().trim().min(1, 'El título es requerido').max(200, 'Máximo 200 caracteres'),
  preconditions: text(2000),
  given: text(2000),
  when: text(2000),
  then: text(2000),
  status: z.enum(TEST_STATUSES),
  priority: z.enum(TEST_PRIORITIES),
  notes: text(2000),
  executedAt: z.date().nullable().optional(),
  executedBy: z.string().trim().max(160).nullable().optional(),
  assignedTo: z.string().nullable().optional(),
})
export const updateTestCaseSchema = createTestCaseSchema.partial()

export const executeTestCaseSchema = z.object({
  status: z.enum(TEST_STATUSES),
  executedBy: z.string().trim().min(1, 'Indicá quién ejecutó la prueba').max(160),
  notes: text(2000),
})

export const acceptanceCriterionSchema = z.string().trim().min(1).max(500)
