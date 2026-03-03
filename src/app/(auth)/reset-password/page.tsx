/**
 * @file page.tsx
 * @module app/(auth)/reset-password
 * Reset password page — thin wrapper around ResetPasswordForm.
 */

import { ResetPasswordForm } from '@/features/auth/components/reset-password-form'
import { SuspenseFallback } from '@/components/shared/suspense-fallback'

export const metadata = {
  title: 'Reset Password',
}

export default function ResetPasswordPage(): React.ReactElement {
  return (
    <SuspenseFallback>
      <ResetPasswordForm />
    </SuspenseFallback>
  )
}
