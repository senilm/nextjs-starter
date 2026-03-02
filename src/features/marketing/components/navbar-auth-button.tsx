/**
 * @file navbar-auth-button.tsx
 * @module features/marketing/components/navbar-auth-button
 * Client component that shows Dashboard link or Get Started CTA based on auth state.
 */

'use client'

import Link from 'next/link'

import { useSession } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'

export const NavbarAuthButton = (): React.ReactNode => {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return <Button size="sm" disabled className="w-24 opacity-50">Loading</Button>
  }

  if (session) {
    return (
      <Button size="sm" asChild>
        <Link href="/dashboard">Dashboard</Link>
      </Button>
    )
  }

  return (
    <Button size="sm" asChild>
      <Link href="/sign-up">Get Started</Link>
    </Button>
  )
}
