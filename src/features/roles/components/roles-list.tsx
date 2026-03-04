/**
 * @file roles-list.tsx
 * @module features/roles/components/roles-list
 * Roles management container — table with CRUD actions and permission matrix dialogs.
 */

'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Shield } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PageHeader } from '@/components/shared/page-header'
import { TableSkeleton } from '@/components/shared/loading-skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { LoadingTransition } from '@/components/shared/loading-transition'
import { useDialogStore, DIALOG_KEY } from '@/stores/dialog-store'
import { usePermission } from '@/hooks/use-permission'
import { useRoles } from '@/features/roles/hooks'
import { DeleteRoleDialog } from '@/features/roles/components/delete-role-dialog'
import type { RoleWithPermissions } from '@/features/roles/types'

export const RolesList = (): React.ReactNode => {
  const canCreate = usePermission('roles.create')
  const canEdit = usePermission('roles.edit')
  const canDelete = usePermission('roles.delete')

  const { openDialog } = useDialogStore()
  const { data: roles, isLoading } = useRoles()
  const [deleteRole, setDeleteRole] = useState<RoleWithPermissions | null>(null)

  const handleEdit = (role: RoleWithPermissions): void => {
    openDialog(DIALOG_KEY.EDIT_ROLE, role)
  }

  const handleCreate = (): void => {
    openDialog(DIALOG_KEY.CREATE_ROLE)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles"
        description="Manage roles and their associated permissions."
        actions={
          canCreate ? (
            <Button onClick={handleCreate}>
              <Plus className="mr-2 size-4" />
              Create Role
            </Button>
          ) : undefined
        }
      />

      <LoadingTransition isLoading={isLoading} loader={<TableSkeleton rows={4} columns={5} />}>
        {!roles?.length ? (
          <EmptyState icon={Shield} title="No roles found" description="Create your first role to get started." />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell className="text-muted-foreground">{role.description ?? '—'}</TableCell>
                    <TableCell>
                      {role.isSystem ? (
                        <Badge variant="default">System</Badge>
                      ) : (
                        <Badge variant="outline">Custom</Badge>
                      )}
                    </TableCell>
                    <TableCell>{role.userCount}</TableCell>
                    <TableCell>{role.permissionKeys.length}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {canEdit && (
                          <Button variant="ghost" size="icon" className="size-8" onClick={() => handleEdit(role)}>
                            <Pencil className="size-4" />
                          </Button>
                        )}
                        {canDelete && !role.isSystem && (
                          <Button variant="ghost" size="icon" className="size-8" onClick={() => setDeleteRole(role)}>
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </LoadingTransition>

      <DeleteRoleDialog role={deleteRole} open={!!deleteRole} onOpenChange={(open) => !open && setDeleteRole(null)} />
    </div>
  )
}
