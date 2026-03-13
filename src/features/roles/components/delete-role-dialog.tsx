/**
 * @file delete-role-dialog.tsx
 * @module features/roles/components/delete-role-dialog
 * Confirmation dialog for deleting a role — blocked if system role or has users.
 */

'use client'

import { Button } from '@/components/ui/button'
import { DialogShell, DialogFooter } from '@/components/shared/dialog-shell'
import { useDeleteRole } from '@/features/roles/hooks'
import type { RoleWithPermissions } from '@/features/roles/types'
import { useDialogStore, DIALOG_KEY } from '@/stores/dialog-store'

export const DeleteRoleDialog = (): React.ReactNode => {
  const { openDialogs, closeDialog, getDialogData } = useDialogStore()
  const isOpen = openDialogs[DIALOG_KEY.DELETE_ROLE] ?? false
  const role = getDialogData<RoleWithPermissions>(DIALOG_KEY.DELETE_ROLE)
  const deleteMutation = useDeleteRole()

  const isBlocked = role?.isSystem || (role?.userCount ?? 0) > 0
  const blockReason = role?.isSystem
    ? 'System roles cannot be deleted.'
    : (role?.userCount ?? 0) > 0
      ? `This role has ${role?.userCount} assigned user(s). Reassign them before deleting.`
      : null

  const handleDelete = async (): Promise<void> => {
    if (!role || isBlocked) return
    const result = await deleteMutation.mutateAsync(role.id)
    if (result.success) closeDialog(DIALOG_KEY.DELETE_ROLE)
  }

  const description = isBlocked
    ? blockReason ?? ''
    : `Are you sure you want to delete "${role?.name}"? This action cannot be undone.`

  return (
    <DialogShell
      open={isOpen}
      onOpenChange={(o) => !deleteMutation.isPending && !o && closeDialog(DIALOG_KEY.DELETE_ROLE)}
      title="Delete Role"
      description={description}
    >
      <DialogFooter>
        <Button variant="outline" disabled={deleteMutation.isPending} onClick={() => closeDialog(DIALOG_KEY.DELETE_ROLE)}>
          Cancel
        </Button>
        {!isBlocked && (
          <Button
            variant="destructive"
            loading={deleteMutation.isPending}
            onClick={() => void handleDelete()}
          >
            Delete
          </Button>
        )}
      </DialogFooter>
    </DialogShell>
  )
}
