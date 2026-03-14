/**
 * @file layout.tsx
 * @module app/(auth)/layout
 * Split auth layout — left branding panel (desktop) + right auth card.
 */

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Zap } from 'lucide-react'

import { auth } from '@/lib/auth'
import { paths } from '@/lib/paths'
import { APP_NAME } from '@/lib/config'
import { Card, CardContent } from '@/components/ui/card'
import { TooltipProvider } from '@/components/ui/tooltip'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.ReactElement> {
  const session = await auth.api.getSession({ headers: await headers() })

  if (session) {
    redirect(paths.dashboard.home())
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-screen">
        {/* Left branding panel — desktop only */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-primary/[0.03] p-12 lg:flex lg:w-1/2">
          {/* Decorative radial gradient */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 30% 30%, oklch(0.65 0.19 55 / 0.08) 0%, transparent 60%)',
            }}
          />

          {/* Logo */}
          <Link href={paths.home()} className="relative z-10 flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="size-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">{APP_NAME}</span>
          </Link>

          {/* Testimonial */}
          <div className="relative z-10 space-y-4">
            <blockquote className="text-lg font-medium leading-relaxed">
              &ldquo;ShipStation saved us weeks of setup. We launched our MVP in 5 days.&rdquo;
            </blockquote>
            <p className="text-sm text-muted-foreground">Sarah Chen, CTO at LaunchPad</p>
          </div>
        </div>

        {/* Right auth panel */}
        <div className="flex flex-1 flex-col">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 p-6 lg:hidden">
            <Link href={paths.home()} className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Zap className="size-4" />
              </div>
              <span className="text-lg font-bold tracking-tight">{APP_NAME}</span>
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center p-4 lg:p-12">
            <div className="w-full max-w-md">
              <Card>
                <CardContent className="pt-6">{children}</CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
