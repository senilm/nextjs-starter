/**
 * @file constants.ts
 * @module features/email/constants
 * Shared constants used across all email templates.
 */

export const EMAIL_APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'ShipStation'
export const EMAIL_APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
export const EMAIL_SUPPORT = process.env.EMAIL_FROM ?? 'noreply@example.com'
