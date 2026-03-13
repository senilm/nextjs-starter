/**
 * @file audit-detail-sheet.tsx
 * @module features/audit-logs/components/audit-detail-sheet
 * Slide-out sheet showing full audit log entry with JSON diff view.
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatDateTime, capitalize } from '@/lib/format'
import { getAuditLogDetail } from '@/features/audit-logs/actions'
import { ACTION_BADGE_MAP } from '@/features/audit-logs/constants'
import type { AuditLogEntry } from '@/features/audit-logs/types'

interface AuditDetailSheetProps {
  auditId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface DetailRowProps {
  label: string
  children: React.ReactNode
}

const DetailRow = ({ label, children }: DetailRowProps): React.ReactNode => (
  <div className="flex items-center justify-between gap-4 py-2.5">
    <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
    <span className="truncate text-right text-sm font-medium">{children}</span>
  </div>
)

export const AuditDetailSheet = ({
  auditId,
  open,
  onOpenChange,
}: AuditDetailSheetProps): React.ReactNode => {
  const { data: audit, isLoading } = useQuery({
    queryKey: ['audit-log-detail', auditId],
    queryFn: () => getAuditLogDetail(auditId!),
    enabled: !!auditId,
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : !audit ? (
          <SheetHeader>
            <SheetTitle>Audit Log Details</SheetTitle>
            <SheetDescription>Audit log not found.</SheetDescription>
          </SheetHeader>
        ) : (
          <AuditDetailContent audit={audit} />
        )}
      </SheetContent>
    </Sheet>
  )
}

const AuditDetailContent = ({ audit }: { audit: AuditLogEntry }): React.ReactNode => {
  const config = ACTION_BADGE_MAP[audit.action]
  const variant = config?.variant ?? 'default'
  const label = config?.label ?? capitalize(audit.action)

  const hasPrevious = audit.previousValues !== null
  const hasNew = audit.newValues !== null
  const hasBoth = hasPrevious && hasNew

  return (
    <>
      <SheetHeader>
        <SheetTitle>Audit Log Details</SheetTitle>
        <SheetDescription>
          {capitalize(audit.module)} record {audit.action} by {audit.userName}
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-5 px-4 pb-6">
        <section>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            User Information
          </h4>
          <div className="divide-y rounded-lg border">
            <div className="px-4">
              <DetailRow label="Name">{audit.userName || '-'}</DetailRow>
            </div>
            <div className="px-4">
              <DetailRow label="Email">{audit.userEmail || '-'}</DetailRow>
            </div>
            <div className="px-4">
              <DetailRow label="Role">
                <Badge variant="outline">{audit.userRole || '-'}</Badge>
              </DetailRow>
            </div>
          </div>
        </section>

        <section>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Action Details
          </h4>
          <div className="divide-y rounded-lg border">
            <div className="px-4">
              <DetailRow label="Module">
                <StatusBadge variant="default">{capitalize(audit.module)}</StatusBadge>
              </DetailRow>
            </div>
            <div className="px-4">
              <DetailRow label="Action">
                <StatusBadge variant={variant}>{label}</StatusBadge>
              </DetailRow>
            </div>
            <div className="px-4">
              <DetailRow label="Record ID">
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  {audit.recordId || '-'}
                </code>
              </DetailRow>
            </div>
            <div className="px-4">
              <DetailRow label="IP Address">{audit.ipAddress || '-'}</DetailRow>
            </div>
            <div className="px-4">
              <DetailRow label="Timestamp">{formatDateTime(audit.createdAt)}</DetailRow>
            </div>
          </div>
        </section>

        {(hasPrevious || hasNew) && (
          <section>
            <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Changed Values
            </h4>
            {hasBoth ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">Previous</p>
                  <pre className="overflow-auto rounded-lg border bg-muted/50 p-3 text-xs leading-relaxed">
                    {JSON.stringify(audit.previousValues, null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">New</p>
                  <pre className="overflow-auto rounded-lg border bg-muted/50 p-3 text-xs leading-relaxed">
                    {JSON.stringify(audit.newValues, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div>
                {hasPrevious && (
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                      Previous Values
                    </p>
                    <pre className="overflow-auto rounded-lg border bg-muted/50 p-3 text-xs leading-relaxed">
                      {JSON.stringify(audit.previousValues, null, 2)}
                    </pre>
                  </div>
                )}
                {hasNew && (
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-muted-foreground">New Values</p>
                    <pre className="overflow-auto rounded-lg border bg-muted/50 p-3 text-xs leading-relaxed">
                      {JSON.stringify(audit.newValues, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </>
  )
}
