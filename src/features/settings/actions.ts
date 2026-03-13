/**
 * @file actions.ts
 * @module features/settings/actions
 * Server actions for account settings — profile, sessions, account deletion.
 */

'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { after } from 'next/server'

import type { ActionResult } from '@/types/shared'
import { auth } from '@/lib/auth'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { logAudit, getClientIp } from '@/lib/audit'
import { Module, AuditAction } from '@/lib/constants'
import { profileSchema } from '@/features/settings/validations'


interface SessionInfo {
  id: string
  token: string
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
  isCurrent: boolean
}

export async function updateProfile(input: unknown): Promise<ActionResult> {
  const session = await requireAuth()

  const parsed = profileSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' }

  const previousName = session.user.name

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name },
  })

  const ip = await getClientIp()
  after(async () => {
    await logAudit({
      module: Module.Settings,
      action: AuditAction.Updated,
      recordId: session.user.id,
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      userRole: session.user.role?.name,
      previousValues: { name: previousName },
      newValues: { name: parsed.data.name },
      ipAddress: ip,
    })
  })

  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function getActiveSessions(): Promise<SessionInfo[]> {
  const reqHeaders = await headers()
  const session = await auth.api.getSession({ headers: reqHeaders })
  if (!session) throw new Error('Unauthorized')

  const sessions = await auth.api.listSessions({ headers: reqHeaders })

  return (sessions ?? []).map((s) => ({
    id: s.id,
    token: s.token,
    ipAddress: s.ipAddress ?? null,
    userAgent: s.userAgent ?? null,
    createdAt: s.createdAt instanceof Date ? s.createdAt : new Date(s.createdAt),
    isCurrent: s.token === session.session.token,
  }))
}

export async function revokeSession(token: string): Promise<ActionResult> {
  const reqHeaders = await headers()
  const session = await auth.api.getSession({ headers: reqHeaders })
  if (!session) return { success: false, error: 'Unauthorized' }

  await auth.api.revokeSession({ headers: reqHeaders, body: { token } })

  const ip = await getClientIp()
  after(async () => {
    await logAudit({
      module: Module.Settings,
      action: AuditAction.Revoked,
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      userRole: session.user.role?.name,
      newValues: { type: 'session' },
      ipAddress: ip,
    })
  })

  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function revokeAllOtherSessions(): Promise<ActionResult> {
  const reqHeaders = await headers()
  const session = await auth.api.getSession({ headers: reqHeaders })
  if (!session) return { success: false, error: 'Unauthorized' }

  await auth.api.revokeOtherSessions({ headers: reqHeaders })

  const ip = await getClientIp()
  after(async () => {
    await logAudit({
      module: Module.Settings,
      action: AuditAction.Revoked,
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      userRole: session.user.role?.name,
      newValues: { type: 'all_other_sessions' },
      ipAddress: ip,
    })
  })

  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function deleteAccount(password: string): Promise<ActionResult> {
  const reqHeaders = await headers()
  const session = await auth.api.getSession({ headers: reqHeaders })
  if (!session) return { success: false, error: 'Unauthorized' }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  })
  if (!user) return { success: false, error: 'User not found' }

  const verification = await auth.api.signInEmail({
    body: { email: user.email, password },
    asResponse: true,
  })

  if (!verification.ok) {
    return { success: false, error: 'Invalid password' }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { deletedAt: new Date(), isActive: false },
  })

  const ip = await getClientIp()
  after(async () => {
    await logAudit({
      module: Module.Settings,
      action: AuditAction.Deleted,
      recordId: session.user.id,
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      userRole: session.user.role?.name,
      newValues: { type: 'account_deletion' },
      ipAddress: ip,
    })
  })

  await auth.api.revokeOtherSessions({ headers: reqHeaders })
  await auth.api.revokeSession({ headers: reqHeaders, body: { token: session.session.token } })

  return { success: true }
}
