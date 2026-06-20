'use server'

import { prisma } from '@/lib/prisma'
import type { DMMessage, DMConversation, UserProfile } from '@/lib/types'
import { requireUserId, getUserNameMap, isValidObjectId } from './access'

export async function searchUsers(query: string): Promise<UserProfile[]> {
  const userId = await requireUserId()
  const q = query.trim()
  if (!q) return []
  const users = await prisma.user.findMany({
    where: {
      id: { not: userId },
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ],
    },
    select: { id: true, name: true, email: true },
    take: 10,
  })
  return users.map((u) => ({
    id: u.id,
    nombre: u.name ?? u.email ?? 'Usuario',
    email: u.email ?? '',
  }))
}

export async function getConversations(): Promise<DMConversation[]> {
  const userId = await requireUserId()
  const messages = await prisma.directMessage.findMany({
    where: { OR: [{ fromUserId: userId }, { toUserId: userId }] },
    orderBy: { createdAt: 'desc' },
  })

  const latestByOther = new Map<string, DMConversation>()
  for (const m of messages) {
    const other = m.fromUserId === userId ? m.toUserId : m.fromUserId
    if (!latestByOther.has(other)) {
      latestByOther.set(other, {
        userId: other,
        nombre: '',
        lastMessage: m.content,
        lastAt: m.createdAt,
      })
    }
  }

  const names = await getUserNameMap([...latestByOther.keys()])
  return [...latestByOther.values()].map((c) => ({
    ...c,
    nombre: names.get(c.userId) ?? 'Usuario',
  }))
}

export async function getDMMessages(otherUserId: string): Promise<DMMessage[]> {
  if (!isValidObjectId(otherUserId)) return []
  const userId = await requireUserId()
  const rows = await prisma.directMessage.findMany({
    where: {
      OR: [
        { fromUserId: userId, toUserId: otherUserId },
        { fromUserId: otherUserId, toUserId: userId },
      ],
    },
    orderBy: { createdAt: 'asc' },
    take: 500,
  })
  const names = await getUserNameMap([userId, otherUserId])
  return rows.map((r) => ({
    id: r.id,
    fromUserId: r.fromUserId,
    toUserId: r.toUserId,
    fromUserName: names.get(r.fromUserId) ?? 'Usuario',
    content: r.content,
    createdAt: r.createdAt,
  }))
}

export async function sendDMMessage(toUserId: string, content: string): Promise<DMMessage> {
  const userId = await requireUserId()
  if (!isValidObjectId(toUserId)) throw new Error('Destinatario inválido')
  if (toUserId === userId) throw new Error('No podés enviarte un mensaje a vos mismo')
  const trimmed = content.trim()
  if (!trimmed) throw new Error('El mensaje no puede estar vacío')

  const recipient = await prisma.user.findUnique({ where: { id: toUserId }, select: { id: true } })
  if (!recipient) throw new Error('Destinatario inválido')

  const row = await prisma.directMessage.create({
    data: { fromUserId: userId, toUserId, content: trimmed },
  })
  const names = await getUserNameMap([userId])
  return {
    id: row.id,
    fromUserId: row.fromUserId,
    toUserId: row.toUserId,
    fromUserName: names.get(userId) ?? 'Usuario',
    content: row.content,
    createdAt: row.createdAt,
  }
}
