/**
 * @file page.tsx
 * @module app/(auth)/forgot-password
 * Forgot password page — thin wrapper around ForgotPasswordForm.
 */

import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form'

export const metadata = {
  title: 'Forgot Password',
}

export default function ForgotPasswordPage(): React.ReactElement {
  return <ForgotPasswordForm />
}
