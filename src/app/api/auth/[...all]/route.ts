/**
 * @file route.ts
 * @module api/auth
 * Better Auth API route handler for all auth endpoints.
 */

import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'

export const { GET, POST } = toNextJsHandler(auth)
