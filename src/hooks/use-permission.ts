/**
 * @file use-permission.ts
 * @module hooks/use-permission
 * Client-side permission hooks — cosmetic only, never rely on these for security.
 */

'use client'

import { useSession } from '@/lib/auth-client'

/** Check if the current user has a single permission */
export function usePermission(permissionKey: string): boolean {
  const { data: session } = useSession()
  return session?.user?.permissions?.includes(permissionKey) ?? false
}

/** Check multiple permissions, returns a map of key → granted */
export function usePermissions(keys: string[]): Record<string, boolean> {
  const { data: session } = useSession()
  const perms = session?.user?.permissions ?? []
  return Object.fromEntries(keys.map((k) => [k, perms.includes(k)]))
}
