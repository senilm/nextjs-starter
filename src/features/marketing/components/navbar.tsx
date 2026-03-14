/**
 * @file navbar.tsx
 * @module features/marketing/components/navbar
 * Sticky marketing navbar with blur backdrop, logo mark, animated nav links, and auth button.
 */

'use client'

import Link from 'next/link'
import { Zap } from 'lucide-react'

import { APP_NAME } from '@/lib/config'
import { paths } from '@/lib/paths'
import { Button } from '@/components/ui/button'
import { Highlight, HighlightItem } from '@/components/ui/highlight'
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
        <Link href={paths.home()} className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="size-4" />
          </div>
          <span className="text-xl font-bold tracking-tight">{APP_NAME}</span>
        </Link>

        <nav className="hidden items-center md:flex">
          <Highlight
            hover
            click={false}
            className="inset-0 rounded-md bg-accent"
            exitDelay={150}
          >
            {NAV_LINKS.map((link) => (
              <HighlightItem key={link.href}>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              </HighlightItem>
            ))}
          </Highlight>
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
