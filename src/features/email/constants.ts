/**
 * @file constants.ts
 * @module features/email/constants
 * Shared constants used across all email templates.
 */

import { APP_NAME, APP_URL } from '@/lib/config'

export const EMAIL_APP_NAME = APP_NAME
export const EMAIL_APP_URL = APP_URL
export const EMAIL_SUPPORT = process.env.EMAIL_FROM ?? 'noreply@example.com'
