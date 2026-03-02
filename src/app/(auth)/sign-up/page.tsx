/**
 * @file page.tsx
 * @module app/(auth)/sign-up
 * Sign-up page — thin wrapper around SignUpForm feature component.
 */

import { Suspense } from 'react'
import { SignUpForm } from '@/features/auth/components/sign-up-form'

export const metadata = {
  title: 'Sign Up',
}

export default function SignUpPage(): React.ReactElement {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  )
}
