/**
 * @file audit-columns.tsx
 * @module features/audit-logs/components/audit-columns
 * Column definitions for the audit log data table.
 */

'use client'

import type { ColumnDef } from '@tanstack/react-table'

import { DataTableHeader } from '@/components/data-table/data-table-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatDateTime, capitalize } from '@/lib/format'
import { ACTION_BADGE_MAP } from '@/features/audit-logs/constants'
import type { AuditLogEntry } from '@/features/audit-logs/types'

export const auditColumns: ColumnDef<AuditLogEntry>[] = [
  {
    accessorKey: 'userName',
    header: ({ column }) => <DataTableHeader column={column} title="User" />,
    meta: { label: 'User' },
    cell: ({ row }) => (
      <span className="max-w-50 truncate font-medium">{row.getValue('userName') || '-'}</span>
    ),
  },
  {
    accessorKey: 'userEmail',
    header: 'Email',
    meta: { label: 'Email' },
    cell: ({ row }) => (
      <span className="max-w-62.5 truncate text-muted-foreground">
        {row.getValue('userEmail') || '-'}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'module',
    header: 'Module',
    meta: { label: 'Module' },
    cell: ({ row }) => (
      <StatusBadge variant="default">{capitalize(row.getValue('module'))}</StatusBadge>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'action',
    header: 'Action',
    meta: { label: 'Action' },
    cell: ({ row }) => {
      const action = row.getValue('action') as string
      const config = ACTION_BADGE_MAP[action]
      return (
        <StatusBadge variant={config?.variant ?? 'default'}>
          {config?.label ?? capitalize(action)}
        </StatusBadge>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'ipAddress',
    header: 'IP Address',
    meta: { label: 'IP Address' },
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.getValue('ipAddress') || '-'}</span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableHeader column={column} title="Date" />,
    meta: { label: 'Date' },
    cell: ({ row }) => (
      <span className="text-muted-foreground">{formatDateTime(row.getValue('createdAt'))}</span>
    ),
  },
]
