/**
 * @file actions.ts
 * @module features/settings/actions
 * Server actions for account settings — profile, sessions, account deletion.
 */

'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { profileSchema } from '@/features/settings/validations'

interface ActionResult {
  success: boolean
  error?: string
}

interface SessionInfo {
  id: string
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
  isCurrent: boolean
}

export async function updateProfile(input: unknown): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = profileSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name },
  })

  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function getActiveSessions(): Promise<SessionInfo[]> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')

  const sessions = await prisma.session.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      ipAddress: true,
      userAgent: true,
      createdAt: true,
      token: true,
    },
  })

  return sessions.map((s) => ({
    id: s.id,
    ipAddress: s.ipAddress,
    userAgent: s.userAgent,
    createdAt: s.createdAt,
    isCurrent: s.token === session.session.token,
  }))
}

export async function revokeSession(sessionId: string): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { success: false, error: 'Unauthorized' }

  const targetSession = await prisma.session.findFirst({
    where: { id: sessionId, userId: session.user.id },
  })
  if (!targetSession) return { success: false, error: 'Session not found' }

  await prisma.session.delete({ where: { id: sessionId } })

  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function revokeAllOtherSessions(): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { success: false, error: 'Unauthorized' }

  await prisma.session.deleteMany({
    where: {
      userId: session.user.id,
      token: { not: session.session.token },
    },
  })

  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function deleteAccount(): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { success: false, error: 'Unauthorized' }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { deletedAt: new Date(), isActive: false },
  })

  await prisma.session.deleteMany({ where: { userId: session.user.id } })

  return { success: true }
}
