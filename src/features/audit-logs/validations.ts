/**
 * @file validations.ts
 * @module features/audit-logs/validations
 * Zod schemas for audit log query filters.
 */

import { z } from 'zod'

export const auditLogFiltersSchema = z.object({
  search: z.string().optional(),
  module: z.string().optional(),
  action: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
})

export type AuditLogFiltersInput = z.infer<typeof auditLogFiltersSchema>
