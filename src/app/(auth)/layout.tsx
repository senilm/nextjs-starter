/**
 * @file layout.tsx
 * @module app/(auth)/layout
 * Centered card layout for auth pages — redirects to dashboard if authenticated.
 */

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TooltipProvider } from '@/components/ui/tooltip'
import { APP_NAME } from '@/lib/config'

export default async function AuthLayout({
  children,
  title,
}: {
  children: React.ReactNode
  title?: string
}): Promise<React.ReactElement> {
  const session = await auth.api.getSession({ headers: await headers() })

  if (session) {
    redirect('/dashboard')
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-primary">{APP_NAME}</h1>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-center">{title}</CardTitle>
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}
