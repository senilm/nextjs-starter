/**
 * @file user-columns.tsx
 * @module features/admin/components/user-columns
 * Table column definitions for the admin user management table.
 */

'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { MoreHorizontal, Eye, ShieldCheck, Ban, Unlock, Trash2 } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { UserWithRole } from '@/features/admin/types'

interface UserColumnsOptions {
  onViewDetail: (userId: string) => void
  onChangeRole: (userId: string) => void
  onSuspend: (userId: string) => void
  onUnsuspend: (userId: string) => void
  onDelete: (userId: string) => void
  canEdit: boolean
  canDelete: boolean
}

export function getUserColumns(options: UserColumnsOptions): ColumnDef<UserWithRole>[] {
  return [
    {
      accessorKey: 'name',
      header: 'User',
      cell: ({ row }) => {
        const user = row.original
        const initials =
          user.name
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) ?? 'U'
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{user.name}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const role = row.original.role
        return role ? <Badge variant="secondary">{role.name}</Badge> : <Badge variant="outline">No role</Badge>
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const active = row.original.isActive
        return active ? (
          <Badge variant="default" className="bg-emerald-600">
            Active
          </Badge>
        ) : (
          <Badge variant="destructive">Suspended</Badge>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined',
      cell: ({ row }) => format(new Date(row.original.createdAt), 'MMM d, yyyy'),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => options.onViewDetail(user.id)}>
                <Eye className="mr-2 size-4" />
                View Details
              </DropdownMenuItem>
              {options.canEdit && (
                <>
                  <DropdownMenuItem onClick={() => options.onChangeRole(user.id)}>
                    <ShieldCheck className="mr-2 size-4" />
                    Change Role
                  </DropdownMenuItem>
                  {user.isActive ? (
                    <DropdownMenuItem onClick={() => options.onSuspend(user.id)}>
                      <Ban className="mr-2 size-4" />
                      Suspend
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => options.onUnsuspend(user.id)}>
                      <Unlock className="mr-2 size-4" />
                      Unsuspend
                    </DropdownMenuItem>
                  )}
                </>
              )}
              {options.canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => options.onDelete(user.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 size-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
