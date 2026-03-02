/**
 * @file page.tsx
 * @module app/(auth)/sign-in
 * Sign-in page — thin wrapper around SignInForm feature component.
 */

import { Suspense } from 'react'
import { SignInForm } from '@/features/auth/components/sign-in-form'

export const metadata = {
  title: 'Sign In',
}

export default function SignInPage(): React.ReactElement {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  )
}
