/**
 * @file roles-list.tsx
 * @module features/roles/components/roles-list
 * Roles management table with bulk delete and permission-gated actions.
 */

'use client'

import { useState, useMemo } from 'react'
import type { RowSelectionState } from '@tanstack/react-table'
import { Plus, Shield } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableBulkActions } from '@/components/data-table/data-table-bulk-actions'
import { getSelectColumn } from '@/components/data-table/data-table-select-column'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { usePermission } from '@/hooks/use-permission'
import { useDialogStore, DIALOG_KEY } from '@/stores/dialog-store'
import { useRoles, useBulkDeleteRoles } from '@/features/roles/hooks'
import { getRoleColumns } from '@/features/roles/components/role-columns'
import type { RoleWithPermissions } from '@/features/roles/types'

export const RolesList = (): React.ReactNode => {
  const canCreate = usePermission('roles.create')
  const canEdit = usePermission('roles.edit')
  const canDelete = usePermission('roles.delete')

  const { openDialog } = useDialogStore()
  const { data: roles, isLoading } = useRoles()
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const bulkDelete = useBulkDeleteRoles()
  const selectedIds = Object.keys(rowSelection)

  const columns = useMemo(
    () => [
      ...(canDelete ? [getSelectColumn<RoleWithPermissions>()] : []),
      ...getRoleColumns({
        onEdit: (role) => openDialog(DIALOG_KEY.EDIT_ROLE, role),
        onDelete: (role) => openDialog(DIALOG_KEY.DELETE_ROLE, role),
        canEdit,
        canDelete,
      }),
    ],
    [canEdit, canDelete, openDialog],
  )

  const handleBulkDelete = async (): Promise<void> => {
    const result = await bulkDelete.mutateAsync(selectedIds)
    if (result.success) {
      setRowSelection({})
      setBulkDeleteOpen(false)
    }
  }

  const isEmpty = !isLoading && !roles?.length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles"
        description="Manage roles and their associated permissions."
        actions={
          canCreate ? (
            <Button onClick={() => openDialog(DIALOG_KEY.CREATE_ROLE)}>
              <Plus className="mr-2 size-4" />
              Create Role
            </Button>
          ) : undefined
        }
      />

      {isEmpty ? (
        <EmptyState icon={Shield} title="No roles found" description="Create your first role to get started." />
      ) : (
        <DataTable
          columns={columns}
          data={roles ?? []}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          emptyTitle="No roles found"
          emptyDescription="Create your first role to get started."
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          bulkActions={
            canDelete ? (
              <DataTableBulkActions
                selectedCount={selectedIds.length}
                onDelete={() => setBulkDeleteOpen(true)}
                onClear={() => setRowSelection({})}
              />
            ) : undefined
          }
        />
      )}

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title="Delete Roles"
        description={`Are you sure you want to delete ${selectedIds.length} role${selectedIds.length !== 1 ? 's' : ''}? System roles will be skipped.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => void handleBulkDelete()}
        isLoading={bulkDelete.isPending}
      />
    </div>
  )
}
