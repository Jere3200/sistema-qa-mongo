import type {
  Project as DbProject,
  Module as DbModule,
  UserStory as DbUserStory,
  AcceptanceCriterion as DbAcceptanceCriterion,
  TestCase as DbTestCase,
} from '@prisma/client'
import type {
  Project,
  Module,
  UserStory,
  AcceptanceCriterion,
  TestCase,
  ProjectStatus,
  UserStoryStatus,
  UserStoryPriority,
  TestCaseStatus,
  TestCasePriority,
} from '@/lib/types'

// Mapean filas de Prisma al modelo de dominio. El cast de los campos de estado/prioridad
// es seguro: la DB solo guarda valores válidos generados por la propia app.

export function toProject(p: DbProject): Project {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status as ProjectStatus,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }
}

export function toModule(m: DbModule): Module {
  return {
    id: m.id,
    projectId: m.projectId,
    name: m.name,
    description: m.description,
    order: m.order,
    createdAt: m.createdAt,
  }
}

export function toAcceptanceCriterion(c: DbAcceptanceCriterion): AcceptanceCriterion {
  return {
    id: c.id,
    userStoryId: c.userStoryId,
    description: c.description,
    order: c.order,
  }
}

export function toUserStory(s: DbUserStory, criteria: DbAcceptanceCriterion[] = []): UserStory {
  return {
    id: s.id,
    projectId: s.projectId,
    moduleId: s.moduleId,
    code: s.code,
    title: s.title,
    asA: s.asA,
    iWant: s.iWant,
    soThat: s.soThat,
    status: s.status as UserStoryStatus,
    priority: s.priority as UserStoryPriority,
    acceptanceCriteria: [...criteria]
      .sort((a, b) => a.order - b.order)
      .map(toAcceptanceCriterion),
    assignedTo: s.assignedTo,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }
}

export function toTestCase(t: DbTestCase): TestCase {
  return {
    id: t.id,
    projectId: t.projectId,
    userStoryId: t.userStoryId,
    code: t.code,
    title: t.title,
    preconditions: t.preconditions,
    given: t.given,
    when: t.when,
    then: t.then,
    status: t.status as TestCaseStatus,
    priority: t.priority as TestCasePriority,
    executedAt: t.executedAt,
    executedBy: t.executedBy,
    notes: t.notes,
    assignedTo: t.assignedTo,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }
}

/** Agrupa filas por una clave (para evitar N+1 al adjuntar criterios/casos). */
export function groupBy<T, K extends string>(items: T[], keyFn: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>()
  for (const item of items) {
    const key = keyFn(item)
    const arr = map.get(key)
    if (arr) arr.push(item)
    else map.set(key, [item])
  }
  return map
}
