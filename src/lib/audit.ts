/**
 * @file audit.ts
 * @module lib/audit
 * Core audit logging utility — writes immutable audit records to the database.
 */

import { headers } from 'next/headers'
import type { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import type { Module, AuditAction } from '@/lib/constants'

interface AuditLogInput {
  module: Module
  action: AuditAction
  recordId?: string
  userId: string
  userName: string
  userEmail: string
  userRole?: string
  previousValues?: Prisma.InputJsonValue
  newValues?: Prisma.InputJsonValue
  ipAddress?: string
}

/** Write an immutable audit log entry. Call inside `after()` for non-blocking writes. */
export async function logAudit(input: AuditLogInput): Promise<void> {
  await prisma.auditLog.create({ data: input })
}

/** Extract client IP from request headers (x-forwarded-for or x-real-ip). */
export async function getClientIp(): Promise<string> {
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? 'unknown'
}
