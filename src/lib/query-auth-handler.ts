/**
 * @file query-auth-handler.ts
 * @module lib/query-auth-handler
 * Global auth error handler for TanStack Query — signs out and redirects on expired sessions.
 */

'use client'

import { signOut } from '@/lib/auth-client'
import { paths } from '@/lib/paths'

export const isAuthError = (error: unknown): boolean =>
  error instanceof Error && (error.message === 'Unauthorized' || error.message === 'UNAUTHORIZED')

export const handleAuthError = (error: unknown): void => {
  if (isAuthError(error)) {
    void signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = paths.auth.signIn()
        },
      },
    })
  }
}
