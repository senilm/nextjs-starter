/**
 * @file active-sessions.tsx
 * @module features/settings/components/active-sessions
 * Active sessions table with revoke buttons.
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Monitor, Smartphone, Globe } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatRelativeTime } from '@/lib/format'
import { getActiveSessions, revokeSession, revokeAllOtherSessions } from '@/features/settings/actions'

const SESSIONS_KEY = ['settings', 'sessions']

function getDeviceIcon(userAgent: string | null): React.ReactNode {
  if (!userAgent) return <Globe className="size-4" />
  if (/mobile|android|iphone/i.test(userAgent)) return <Smartphone className="size-4" />
  return <Monitor className="size-4" />
}

function getBrowserName(userAgent: string | null): string {
  if (!userAgent) return 'Unknown browser'
  if (/firefox/i.test(userAgent)) return 'Firefox'
  if (/edg/i.test(userAgent)) return 'Edge'
  if (/chrome/i.test(userAgent)) return 'Chrome'
  if (/safari/i.test(userAgent)) return 'Safari'
  return 'Unknown browser'
}

export const ActiveSessions = (): React.ReactNode => {
  const queryClient = useQueryClient()

  const { data: sessions, isLoading } = useQuery({
    queryKey: SESSIONS_KEY,
    queryFn: () => getActiveSessions(),
  })

  const revokeMutation = useMutation({
    mutationFn: (sessionId: string) => revokeSession(sessionId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Session revoked')
        void queryClient.invalidateQueries({ queryKey: SESSIONS_KEY })
      } else {
        toast.error(result.error ?? 'Failed to revoke session')
      }
    },
  })

  const revokeAllMutation = useMutation({
    mutationFn: () => revokeAllOtherSessions(),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('All other sessions revoked')
        void queryClient.invalidateQueries({ queryKey: SESSIONS_KEY })
      } else {
        toast.error(result.error ?? 'Failed to revoke sessions')
      }
    },
  })

  const otherSessionCount = sessions?.filter((s) => !s.isCurrent).length ?? 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Manage your active sessions across devices.</CardDescription>
        </div>
        {otherSessionCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => revokeAllMutation.mutate()}
            loading={revokeAllMutation.isPending}
          >
            Revoke all others
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={`session-skeleton-${i}`} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {sessions?.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  {getDeviceIcon(s.userAgent)}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{getBrowserName(s.userAgent)}</p>
                      {s.isCurrent && (
                        <Badge variant="secondary" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {s.ipAddress ?? 'Unknown IP'} &middot;{' '}
                      {formatRelativeTime(s.createdAt)}
                    </p>
                  </div>
                </div>
                {!s.isCurrent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => revokeMutation.mutate(s.id)}
                    loading={revokeMutation.isPending}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
