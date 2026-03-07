/**
 * @file permission-guard.tsx
 * @module components/shared/permission-guard
 * Full-page access denied UI for permission-gated routes.
 */

'use client'

import { ShieldAlert } from 'lucide-react'

import { usePermission } from '@/hooks/use-permission'

interface PermissionGuardProps {
  permission: string
  children: React.ReactNode
}

export const PermissionGuard = ({
  permission,
  children,
}: PermissionGuardProps): React.ReactNode => {
  const hasAccess = usePermission(permission)

  if (!hasAccess) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-destructive/10 p-4">
          <ShieldAlert className="size-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Access Denied</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            You do not have permission to access this page. Contact your administrator if you believe this is an error.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
