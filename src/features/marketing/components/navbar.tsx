/**
 * @file navbar.tsx
 * @module features/marketing/components/navbar
 * Sticky marketing navbar with blur backdrop, logo, desktop nav links, and auth button.
 */

import Link from 'next/link'

import { APP_NAME } from '@/lib/config'
import { paths } from '@/lib/paths'
import { Button } from '@/components/ui/button'
import { NavbarAuthButton } from '@/features/marketing/components/navbar-auth-button'
import { MobileNav } from '@/features/marketing/components/mobile-nav'
import { ThemeToggle } from '@/features/marketing/components/theme-toggle'

const NAV_LINKS = [
  { href: paths.pricing(), label: 'Pricing' },
  { href: paths.blog.list(), label: 'Blog' },
  { href: paths.contact(), label: 'Contact' },
] as const

export const Navbar = (): React.ReactNode => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={paths.home()} className="text-xl font-bold tracking-tight">
          {APP_NAME}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Button key={link.href} variant="ghost" size="sm" asChild>
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden md:block">
            <NavbarAuthButton />
          </div>
          <div className="md:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  )
}
