/**
 * @file navbar-auth-button.tsx
 * @module features/marketing/components/navbar-auth-button
 * Client component that shows Dashboard link or Get Started CTA based on auth state.
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useSession } from '@/lib/auth-client'
import { paths } from '@/lib/paths'
import { Button } from '@/components/ui/button'

const AUTH_PATHS = [
  paths.auth.signIn(),
  paths.auth.signUp(),
  paths.auth.forgotPassword(),
  paths.auth.resetPassword(),
  paths.auth.verifyEmail(),
]

export const NavbarAuthButton = (): React.ReactNode => {
  const { data: session, isPending } = useSession()
  const pathname = usePathname()

  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p))

  if (isPending) {
    return <Button size="sm" disabled className="w-24 opacity-50">Loading</Button>
  }

  if (session) {
    return (
      <Button size="sm" asChild>
        <Link href={paths.dashboard.home()}>Dashboard</Link>
      </Button>
    )
  }

  if (isAuthPage) {
    return (
      <Button size="sm" variant="outline" asChild>
        <Link href={pathname === paths.auth.signIn() ? paths.auth.signUp() : paths.auth.signIn()}>
          {pathname === paths.auth.signIn() ? 'Sign up' : 'Sign in'}
        </Link>
      </Button>
    )
  }

  return (
    <Button size="sm" asChild>
      <Link href={paths.auth.signUp()}>Get Started</Link>
    </Button>
  )
}
