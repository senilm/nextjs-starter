/**
 * @file role-columns.tsx
 * @module features/roles/components/role-columns
 * Column definitions for the roles data table.
 */

'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Pencil, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { RoleWithPermissions } from '@/features/roles/types'

interface RoleColumnActions {
  onEdit: (role: RoleWithPermissions) => void
  onDelete: (role: RoleWithPermissions) => void
  canEdit: boolean
  canDelete: boolean
}

export const getRoleColumns = ({
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: RoleColumnActions): ColumnDef<RoleWithPermissions>[] => {
  return [
    {
      accessorKey: 'name',
      header: 'Name',
      meta: { label: 'Name' },
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      meta: { label: 'Description' },
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.description ?? '—'}</span>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      meta: { label: 'Type' },
      enableSorting: false,
      cell: ({ row }) =>
        row.original.isSystem ? (
          <Badge variant="default">System</Badge>
        ) : (
          <Badge variant="outline">Custom</Badge>
        ),
    },
    {
      accessorKey: 'userCount',
      header: 'Users',
      meta: { label: 'Users' },
    },
    {
      id: 'permissions',
      header: 'Permissions',
      meta: { label: 'Permissions' },
      enableSorting: false,
      cell: ({ row }) => row.original.permissionKeys.length,
    },
    {
      id: 'actions',
      header: '',
      enableHiding: false,
      cell: ({ row }) => {
        const role = row.original
        return (
          <div className="flex gap-1">
            {canEdit && (
              <Button variant="ghost" size="icon" className="size-8" onClick={() => onEdit(role)}>
                <Pencil className="size-4" />
              </Button>
            )}
            {canDelete && !role.isSystem && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => onDelete(role)}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            )}
          </div>
        )
      },
    },
  ]
}
