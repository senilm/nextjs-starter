/**
 * @file user-management.tsx
 * @module features/admin/components/user-management
 * Admin user management container — filters, table, action dialogs.
 */

'use client'

import { useState, useMemo } from 'react'
import { UserPlus, Users } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { DataTableFilter, type FilterField } from '@/components/data-table/data-table-filter'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { usePermission } from '@/hooks/use-permission'
import { useDebounce } from '@/hooks/use-debounce'
import { usePagination } from '@/hooks/use-pagination'
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

const STATUS_FILTER_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'suspended' },
]

export const UserManagement = (): React.ReactNode => {
  const canEdit = usePermission('users.edit')
  const canCreate = usePermission('users.create')
  const canDelete = usePermission('users.delete')

  const { page, limit, setPage, setLimit, resetPage } = usePagination()
  const [search, setSearch] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})
  const [detailUserId, setDetailUserId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [suspendUserId, setSuspendUserId] = useState<string | null>(null)
  const [unsuspendUserId, setUnsuspendUserId] = useState<string | null>(null)
  const [changeRoleUserId, setChangeRoleUserId] = useState<string | null>(null)
  const [selectedRoleId, setSelectedRoleId] = useState('')

  const debouncedSearch = useDebounce(search)
  const { data: roles } = useQuery({ queryKey: ['roles'], queryFn: () => getRoles() })

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        key: 'roleId',
        label: 'Role',
        type: 'select' as const,
        placeholder: 'All roles',
        options: roles?.map((role) => ({ label: role.name, value: role.id })) ?? [],
      },
      {
        key: 'status',
        label: 'Status',
        type: 'select' as const,
        placeholder: 'All statuses',
        options: STATUS_FILTER_OPTIONS,
      },
    ],
    [roles],
  )

  const activeFilterCount = Object.values(filterValues).filter(Boolean).length
  const hasActiveFilters = !!debouncedSearch || activeFilterCount > 0

  const filters: UserFilters = {
    search: debouncedSearch || undefined,
    roleId: filterValues.roleId || undefined,
    status: (filterValues.status as UserFilters['status']) || undefined,
    page,
    limit,
  }

  const { data, isLoading, refetch, isRefetching } = useUsers(filters)
  const deleteMutation = useDeleteUser()
  const suspendMutation = useSuspendUser()
  const unsuspendMutation = useUnsuspendUser()
  const changeRoleMutation = useChangeUserRole()

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

  const handleSearchChange = (value: string): void => {
    setSearch(value)
    resetPage()
  }

  const handleFilterChange = (key: string, value: string): void => {
    setFilterValues((prev) => ({ ...prev, [key]: value }))
    resetPage()
  }

  const handleFilterClear = (): void => {
    setFilterValues({})
    resetPage()
  }

  if (!isLoading && !data?.users.length && !hasActiveFilters) {
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
        <EmptyState icon={Users} title="No users found" description="No user accounts exist yet." />
        <InviteUserDialog open={inviteOpen} onOpenChange={setInviteOpen} />
      </div>
    )
  }

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

      <DataTable
        columns={columns}
        data={data?.users ?? []}
        isLoading={isLoading}
        hasActiveFilters={hasActiveFilters}
        emptyTitle="No users found"
        emptyDescription="Try adjusting your search or filters."
        pagination={data ? { page: data.page, limit, total: data.total, totalPages: data.totalPages } : undefined}
        onPageChange={setPage}
        onLimitChange={setLimit}
        toolbar={(columnCustomizer) => (
          <DataTableToolbar
            searchValue={search}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search users..."
            onRefresh={() => void refetch()}
            isRefreshing={isRefetching}
            columnCustomizer={columnCustomizer}
          >
            <DataTableFilter
              fields={filterFields}
              values={filterValues}
              onChange={handleFilterChange}
              onClear={handleFilterClear}
              activeCount={activeFilterCount}
            />
          </DataTableToolbar>
        )}
      />

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
              disabled={!selectedRoleId}
              loading={changeRoleMutation.isPending}
              onClick={() => {
                if (changeRoleUserId && selectedRoleId) {
                  changeRoleMutation.mutate({ userId: changeRoleUserId, roleId: selectedRoleId })
                  setChangeRoleUserId(null)
                  setSelectedRoleId('')
                }
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
