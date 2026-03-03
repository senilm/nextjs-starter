/**
 * @file layout.tsx
 * @module app/(auth)/layout
 * Centered card layout for auth pages — redirects to dashboard if authenticated.
 */

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { paths } from '@/lib/paths'
import { Card, CardContent } from '@/components/ui/card'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Navbar } from '@/features/marketing/components/navbar'

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
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card>
              <CardContent className="pt-6">{children}</CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
