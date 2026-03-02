/**
 * @file page.tsx
 * @module app/(auth)/reset-password
 * Reset password page — thin wrapper around ResetPasswordForm.
 */

import { Suspense } from 'react'
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form'

export const metadata = {
  title: 'Reset Password',
}

export default function ResetPasswordPage(): React.ReactElement {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
