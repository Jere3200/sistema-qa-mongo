import type { Module } from '@/lib/types'

export async function getModules(_projectId: string): Promise<Module[]> {
  return []
}

export async function getModule(_id: string): Promise<Module | undefined> {
  return undefined
}

export async function createModule(_data: Omit<Module, 'id' | 'createdAt'>): Promise<Module> {
  throw new Error('Not connected to database')
}

export async function updateModule(_id: string, _data: Partial<Module>): Promise<Module | undefined> {
  return undefined
}

export async function deleteModule(_id: string): Promise<boolean> {
  return false
}
