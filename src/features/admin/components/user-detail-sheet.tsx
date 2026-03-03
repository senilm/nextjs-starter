/**
 * @file user-detail-sheet.tsx
 * @module features/admin/components/user-detail-sheet
 * Sheet panel showing user profile, role, permissions, subscription, and sessions.
 */

'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatDateTime } from '@/lib/format'
import { useUserDetail } from '@/features/admin/hooks'

interface UserDetailSheetProps {
  userId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const UserDetailSheet = ({ userId, open, onOpenChange }: UserDetailSheetProps): React.ReactNode => {
  const { data: user, isLoading } = useUserDetail(userId)

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ?? 'U'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>User Details</SheetTitle>
          <SheetDescription>View user profile and account information.</SheetDescription>
        </SheetHeader>

        {isLoading || !user ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="space-y-6 p-4">
            <div className="flex items-center gap-4">
              <Avatar className="size-14">
                <AvatarImage src={user.image ?? undefined} alt={user.name} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="mt-1 flex gap-2">
                  {user.isActive ? (
                    <Badge variant="default" className="bg-emerald-600">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Suspended</Badge>
                  )}
                  {user.emailVerified && <Badge variant="secondary">Verified</Badge>}
                  {user.twoFactorEnabled && <Badge variant="secondary">2FA</Badge>}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Role &amp; Permissions</h4>
              <p className="text-sm text-muted-foreground">
                Role: <span className="font-medium text-foreground">{user.role?.name ?? 'No role'}</span>
              </p>
              {user.permissions.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {user.permissions.map((perm) => (
                    <Badge key={perm} variant="outline" className="text-xs">
                      {perm}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No permissions assigned.</p>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Subscription</h4>
              {user.subscription ? (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {user.subscription.plan}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{user.subscription.status}</span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No active subscription.</p>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Recent Sessions</h4>
              {user.sessions.length > 0 ? (
                <div className="space-y-2">
                  {user.sessions.map((session) => (
                    <div key={session.id} className="rounded-md border p-3 text-sm">
                      <p className="font-medium">{session.ipAddress ?? 'Unknown IP'}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {session.userAgent ?? 'Unknown device'}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDateTime(session.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No active sessions.</p>
              )}
            </div>

            <Separator />

            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Joined: {formatDate(user.createdAt)}</p>
              <p>Last updated: {formatDate(user.updatedAt)}</p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
