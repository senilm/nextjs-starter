/**
 * @file actions.ts
 * @module features/audit-logs/actions
 * Server actions for audit log viewing and export — permission-gated per module.
 */

'use server'

import { requirePermission } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/lib/rbac'
import { Module, Action, perm, PAGINATION } from '@/lib/constants'
import { auditLogFiltersSchema } from '@/features/audit-logs/validations'
import type { AuditLogFilters, AuditLogsResponse, AuditLogEntry } from '@/features/audit-logs/types'


/** Get modules the user is allowed to view audit logs for */
async function getAllowedModules(userId: string): Promise<string[]> {
  const permissions = await getUserPermissions(userId)
  return Object.values(Module).filter((mod) => permissions.includes(perm(mod, Action.View)))
}

export async function getAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLogsResponse> {
  const session = await requirePermission(perm(Module.Audits, Action.View))

  const parsed = auditLogFiltersSchema.safeParse(filters)
  if (!parsed.success) return { logs: [], total: 0, page: 1, totalPages: 0 }

  const allowedModules = await getAllowedModules(session.user.id)
  if (allowedModules.length === 0) return { logs: [], total: 0, page: 1, totalPages: 0 }

  const page = parsed.data.page ?? PAGINATION.DEFAULT_PAGE
  const limit = parsed.data.limit ?? PAGINATION.DEFAULT_LIMIT
  const skip = (page - 1) * limit

  const where = buildWhereClause(parsed.data, allowedModules)

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ])

  return {
    logs: logs as AuditLogEntry[],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getAuditLogDetail(id: string): Promise<AuditLogEntry | null> {
  const session = await requirePermission(perm(Module.Audits, Action.View))

  const allowedModules = await getAllowedModules(session.user.id)

  const log = await prisma.auditLog.findFirst({
    where: { id, module: { in: allowedModules } },
  })

  return log as AuditLogEntry | null
}

export async function exportAuditLogs(
  filters: AuditLogFilters = {},
): Promise<AuditLogEntry[]> {
  const session = await requirePermission(perm(Module.Audits, Action.View))

  const parsed = auditLogFiltersSchema.safeParse(filters)
  if (!parsed.success) return []

  const allowedModules = await getAllowedModules(session.user.id)
  if (allowedModules.length === 0) return []

  const where = buildWhereClause(parsed.data, allowedModules)

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: PAGINATION.EXPORT_MAX_LIMIT,
  })

  return logs as AuditLogEntry[]
}

function buildWhereClause(
  filters: {
    search?: string
    module?: string
    action?: string
    fromDate?: string
    toDate?: string
  },
  allowedModules: string[],
): Record<string, unknown> {
  const moduleFilter = filters.module && allowedModules.includes(filters.module)
    ? filters.module
    : undefined

  return {
    module: { in: moduleFilter ? [moduleFilter] : allowedModules },
    ...(filters.action ? { action: filters.action } : {}),
    ...(filters.search
      ? {
          OR: [
            { userName: { contains: filters.search, mode: 'insensitive' as const } },
            { userEmail: { contains: filters.search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
    ...((filters.fromDate || filters.toDate)
      ? {
          createdAt: {
            ...(filters.fromDate ? { gte: new Date(`${filters.fromDate}T00:00:00`) } : {}),
            ...(filters.toDate ? { lte: new Date(`${filters.toDate}T23:59:59`) } : {}),
          },
        }
      : {}),
  }
}
