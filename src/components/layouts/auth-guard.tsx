/**
 * @file auth-guard.tsx
 * @module components/layouts/auth-guard
 * Server component that validates session and redirects unauthenticated users.
 */

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { paths } from '@/lib/paths'

export const AuthGuard = async ({
  children,
}: Readonly<{
  children: React.ReactNode
}>): Promise<React.ReactNode> => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect(paths.auth.signIn())

  return <>{children}</>
}
