/**
 * @file page.tsx
 * @module app/(admin)/admin/audit-logs/page
 * Admin audit logs page — thin wrapper for the AuditManagement feature component.
 */

import { AuditManagement } from '@/features/audit-logs/components/audit-management'

export default function AdminAuditLogsPage(): React.ReactNode {
  return <AuditManagement />
}
