/**
 * @file auth-client.ts
 * @module lib/auth-client
 * Better Auth client-side configuration with all plugins.
 */

'use client'

import { createAuthClient } from 'better-auth/react'
import { stripeClient } from '@better-auth/stripe/client'
import { twoFactorClient } from 'better-auth/client/plugins'
import { magicLinkClient } from 'better-auth/client/plugins'
import { customSessionClient } from 'better-auth/client/plugins'
import type { auth } from '@/lib/auth'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [
    stripeClient({ subscription: true }),
    twoFactorClient(),
    magicLinkClient(),
    customSessionClient<typeof auth>(),
  ],
})

export const { useSession, signIn, signUp, signOut } = authClient
