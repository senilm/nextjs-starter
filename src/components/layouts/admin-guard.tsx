/**
 * @file admin-guard.tsx
 * @module components/layouts/admin-guard
 * Server component that checks admin permission and redirects unauthorized users.
 */

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { hasPermission } from '@/lib/rbac'
import { paths } from '@/lib/paths'

export const AdminGuard = async ({
  children,
}: Readonly<{
  children: React.ReactNode
}>): Promise<React.ReactNode> => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect(paths.auth.signIn())

  const allowed = await hasPermission(session.user.id, 'admin.access')
  if (!allowed) redirect('/dashboard')

  return <>{children}</>
}
