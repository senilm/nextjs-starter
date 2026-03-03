/**
 * @file page.tsx
 * @module app/(auth)/sign-up
 * Sign-up page — thin wrapper around SignUpForm feature component.
 */

import { SignUpForm } from '@/features/auth/components/sign-up-form'
import { SuspenseFallback } from '@/components/shared/suspense-fallback'

export const metadata = {
  title: 'Sign Up',
}

export default function SignUpPage(): React.ReactElement {
  return (
    <SuspenseFallback>
      <SignUpForm />
    </SuspenseFallback>
  )
}
