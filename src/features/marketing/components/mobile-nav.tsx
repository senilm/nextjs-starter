/**
 * @file mobile-nav.tsx
 * @module features/marketing/components/mobile-nav
 * Sheet-based hamburger menu for mobile navigation.
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'

import { APP_NAME } from '@/lib/config'
import { paths } from '@/lib/paths'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { NavbarAuthButton } from '@/features/marketing/components/navbar-auth-button'

const NAV_LINKS = [
  { href: paths.home(), label: 'Home' },
  { href: paths.pricing(), label: 'Pricing' },
  { href: paths.blog.list(), label: 'Blog' },
  { href: paths.contact(), label: 'Contact' },
] as const

export const MobileNav = (): React.ReactNode => {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Open menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle>{APP_NAME}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {NAV_LINKS.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              className="justify-start"
              asChild
              onClick={() => setOpen(false)}
            >
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
          <div className="mt-4">
            <NavbarAuthButton />
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
