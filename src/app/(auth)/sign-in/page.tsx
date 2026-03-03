/**
 * @file page.tsx
 * @module app/(auth)/sign-in
 * Sign-in page — thin wrapper around SignInForm feature component.
 */

import { SignInForm } from '@/features/auth/components/sign-in-form'
import { SuspenseFallback } from '@/components/shared/suspense-fallback'

export const metadata = {
  title: 'Sign In',
}

export default function SignInPage(): React.ReactElement {
  return (
    <SuspenseFallback>
      <SignInForm />
    </SuspenseFallback>
  )
}
