/**
 * @file auth-guard.ts
 * @module lib/auth-guard
 * Shared server-side auth guards for server actions.
 */

import { headers } from 'next/headers'

import { auth, type AuthSession } from '@/lib/auth'
import { hasPermission } from '@/lib/rbac'

export async function requireAuth(): Promise<AuthSession> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  return session
}

export async function requirePermission(permissionKey: string): Promise<AuthSession> {
  const session = await requireAuth()
  const allowed = await hasPermission(session.user.id, permissionKey)
  if (!allowed) throw new Error('Permission denied')
  return session
}
