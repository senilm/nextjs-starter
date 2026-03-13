/**
 * @file constants.ts
 * @module features/audit-logs/constants
 * Shared display configuration for audit action badges.
 */

import { AuditAction } from '@/lib/constants'

type ActionVariant = 'info' | 'warning' | 'destructive' | 'success' | 'default'

export interface ActionBadgeConfig {
  variant: ActionVariant
  label: string
}

export const ACTION_BADGE_MAP: Record<string, ActionBadgeConfig> = {
  [AuditAction.Created]: { variant: 'info', label: 'Created' },
  [AuditAction.Updated]: { variant: 'warning', label: 'Updated' },
  [AuditAction.Deleted]: { variant: 'destructive', label: 'Deleted' },
  [AuditAction.Suspended]: { variant: 'destructive', label: 'Suspended' },
  [AuditAction.Unsuspended]: { variant: 'success', label: 'Unsuspended' },
  [AuditAction.Invited]: { variant: 'info', label: 'Invited' },
  [AuditAction.Canceled]: { variant: 'destructive', label: 'Canceled' },
  [AuditAction.Resumed]: { variant: 'success', label: 'Resumed' },
  [AuditAction.RoleChanged]: { variant: 'warning', label: 'Role Changed' },
  [AuditAction.Revoked]: { variant: 'destructive', label: 'Revoked' },
  [AuditAction.Checkout]: { variant: 'info', label: 'Checkout' },
  [AuditAction.BulkDeleted]: { variant: 'destructive', label: 'Bulk Deleted' },
}
