/**
 * @file types.ts
 * @module features/audit-logs/types
 * Type definitions for audit log feature.
 */

export interface AuditLogEntry {
  id: string
  module: string
  action: string
  recordId: string | null
  userId: string
  userName: string
  userEmail: string
  userRole: string | null
  previousValues: Record<string, unknown> | null
  newValues: Record<string, unknown> | null
  ipAddress: string | null
  createdAt: Date
}

export interface AuditLogFilters {
  search?: string
  module?: string
  action?: string
  fromDate?: string
  toDate?: string
  page?: number
  limit?: number
}

export interface AuditLogsResponse {
  logs: AuditLogEntry[]
  total: number
  page: number
  totalPages: number
}
