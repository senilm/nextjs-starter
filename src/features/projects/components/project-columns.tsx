/**
 * @file project-columns.tsx
 * @module features/projects/components/project-columns
 * Column definitions for the projects data table.
 */

'use client'

import { type ColumnDef } from '@tanstack/react-table'

import { DataTableHeader } from '@/components/data-table/data-table-header'
import { DataTableRowActions } from '@/components/data-table/data-table-row-actions'
import { ProjectStatusBadge } from '@/features/projects/components/project-status-badge'
import { formatDate } from '@/lib/format'
import type { Project, ProjectStatus } from '@/features/projects/types'

interface ColumnActions {
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

export const getProjectColumns = ({ onEdit, onDelete }: ColumnActions): ColumnDef<Project>[] => {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableHeader column={column} title="Name" />,
      meta: { label: 'Name' },
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          {row.original.description && (
            <p className="max-w-xs truncate text-xs text-muted-foreground">{row.original.description}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableHeader column={column} title="Status" />,
      meta: { label: 'Status' },
      cell: ({ row }) => <ProjectStatusBadge status={row.original.status as ProjectStatus} />,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableHeader column={column} title="Created" />,
      meta: { label: 'Created' },
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.createdAt, 'MMM d, yyyy')}
        </span>
      ),
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => <DataTableHeader column={column} title="Updated" />,
      meta: { label: 'Updated' },
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.updatedAt, 'MMM d, yyyy')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      enableHiding: false,
      cell: ({ row }) => (
        <DataTableRowActions
          onEdit={() => onEdit(row.original)}
          onDelete={() => onDelete(row.original)}
        />
      ),
    },
  ]
}
