/**
 * @file user-management.tsx
 * @module features/admin/components/user-management
 * Admin user management container — filters, table, action dialogs.
 */

'use client'

import { useState, useMemo, useCallback } from 'react'
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { UserPlus, Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PageHeader } from '@/components/shared/page-header'
import { TableSkeleton } from '@/components/shared/loading-skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { usePermission } from '@/hooks/use-permission'
import {
  useUsers,
  useChangeUserRole,
  useSuspendUser,
  useUnsuspendUser,
  useDeleteUser,
} from '@/features/admin/hooks'
import { getUserColumns } from '@/features/admin/components/user-columns'
import { UserDetailSheet } from '@/features/admin/components/user-detail-sheet'
import { InviteUserDialog } from '@/features/admin/components/invite-user-dialog'
import { getRoles } from '@/features/roles/actions'
import type { UserFilters } from '@/features/admin/types'
import { Users } from 'lucide-react'

export const UserManagement = (): React.ReactNode => {
  const canEdit = usePermission('users.edit')
  const canCreate = usePermission('users.create')
  const canDelete = usePermission('users.delete')

  const [filters, setFilters] = useState<UserFilters>({ page: 1, limit: 10 })
  const [search, setSearch] = useState('')
  const [detailUserId, setDetailUserId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [suspendUserId, setSuspendUserId] = useState<string | null>(null)
  const [unsuspendUserId, setUnsuspendUserId] = useState<string | null>(null)
  const [changeRoleUserId, setChangeRoleUserId] = useState<string | null>(null)
  const [selectedRoleId, setSelectedRoleId] = useState('')

  const { data, isLoading } = useUsers(filters)
  const { data: roles } = useQuery({ queryKey: ['roles'], queryFn: () => getRoles() })
  const deleteMutation = useDeleteUser()
  const suspendMutation = useSuspendUser()
  const unsuspendMutation = useUnsuspendUser()
  const changeRoleMutation = useChangeUserRole()

  const handleSearch = useCallback((): void => {
    setFilters((prev) => ({ ...prev, search, page: 1 }))
  }, [search])

  const columns = useMemo(
    () =>
      getUserColumns({
        onViewDetail: (id) => {
          setDetailUserId(id)
          setDetailOpen(true)
        },
        onChangeRole: (id) => setChangeRoleUserId(id),
        onSuspend: (id) => setSuspendUserId(id),
        onUnsuspend: (id) => setUnsuspendUserId(id),
        onDelete: (id) => setDeleteUserId(id),
        canEdit,
        canDelete,
      }),
    [canEdit, canDelete],
  )

  const table = useReactTable({
    data: data?.users ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage user accounts, roles, and access."
        actions={
          canCreate ? (
            <Button onClick={() => setInviteOpen(true)}>
              <UserPlus className="mr-2 size-4" />
              Invite User
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9"
          />
        </div>
        <Select
          value={filters.roleId ?? 'all'}
          onValueChange={(v) => setFilters((prev) => ({ ...prev, roleId: v, page: 1 }))}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {roles?.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.status ?? 'all'}
          onValueChange={(v) =>
            setFilters((prev) => ({ ...prev, status: v as UserFilters['status'], page: 1 }))
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} columns={6} />
      ) : !data?.users.length ? (
        <EmptyState icon={Users} title="No users found" description="Try adjusting your search or filters." />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {data.page} of {data.totalPages} ({data.total} total)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={data.page <= 1}
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) - 1 }))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={data.page >= data.totalPages}
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      <UserDetailSheet userId={detailUserId} open={detailOpen} onOpenChange={setDetailOpen} />
      <InviteUserDialog open={inviteOpen} onOpenChange={setInviteOpen} />

      <AlertDialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              This will soft-delete the user and revoke all access. This action cannot be easily undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteUserId) {
                  deleteMutation.mutate(deleteUserId)
                  setDeleteUserId(null)
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!suspendUserId} onOpenChange={(open) => !open && setSuspendUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend User</AlertDialogTitle>
            <AlertDialogDescription>
              This will prevent the user from signing in and revoke all active sessions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (suspendUserId) {
                  suspendMutation.mutate(suspendUserId)
                  setSuspendUserId(null)
                }
              }}
            >
              Suspend
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!unsuspendUserId} onOpenChange={(open) => !open && setUnsuspendUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsuspend User</AlertDialogTitle>
            <AlertDialogDescription>This will restore the user&apos;s access to the platform.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (unsuspendUserId) {
                  unsuspendMutation.mutate(unsuspendUserId)
                  setUnsuspendUserId(null)
                }
              }}
            >
              Unsuspend
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!changeRoleUserId} onOpenChange={(open) => !open && setChangeRoleUserId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>Select a new role for this user.</DialogDescription>
          </DialogHeader>
          <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {roles?.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeRoleUserId(null)}>
              Cancel
            </Button>
            <Button
              disabled={!selectedRoleId || changeRoleMutation.isPending}
              onClick={() => {
                if (changeRoleUserId && selectedRoleId) {
                  changeRoleMutation.mutate({ userId: changeRoleUserId, roleId: selectedRoleId })
                  setChangeRoleUserId(null)
                  setSelectedRoleId('')
                }
              }}
            >
              {changeRoleMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
