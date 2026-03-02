/**
 * @file page.tsx
 * @module app/(auth)/verify-email
 * Verify email page — thin wrapper around VerifyEmail component.
 */

import { VerifyEmail } from '@/features/auth/components/verify-email'

export const metadata = {
  title: 'Verify Email',
}

export default function VerifyEmailPage(): React.ReactElement {
  return <VerifyEmail />
}
