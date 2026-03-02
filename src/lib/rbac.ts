/**
 * @file rbac.ts
 * @module lib/rbac
 * Server-side permission checking — the security boundary for all mutations.
 */

import { prisma } from '@/lib/prisma'

/** Check if a user has a specific permission */
export async function hasPermission(userId: string, permissionKey: string): Promise<boolean> {
  const count = await prisma.rolePermission.count({
    where: {
      role: { users: { some: { id: userId, deletedAt: null } } },
      permission: { key: permissionKey },
    },
  })
  return count > 0
}

/** Check multiple permissions at once, returns a map of key → granted */
export async function hasPermissions(
  userId: string,
  keys: string[],
): Promise<Record<string, boolean>> {
  const results = await prisma.rolePermission.findMany({
    where: {
      role: { users: { some: { id: userId, deletedAt: null } } },
      permission: { key: { in: keys } },
    },
    select: { permission: { select: { key: true } } },
  })
  const granted = new Set(results.map((r) => r.permission.key))
  return Object.fromEntries(keys.map((k) => [k, granted.has(k)]))
}

/** Get all permission keys for a user */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const results = await prisma.rolePermission.findMany({
    where: {
      role: { users: { some: { id: userId, deletedAt: null } } },
    },
    select: { permission: { select: { key: true } } },
  })
  return results.map((r) => r.permission.key)
}

/** Invalidate all sessions for a user — forces re-login with fresh permissions */
export async function invalidateUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } })
}
