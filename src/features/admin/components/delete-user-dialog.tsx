/**
 * @file delete-user-dialog.tsx
 * @module features/admin/components/delete-user-dialog
 * Confirmation dialog for soft-deleting a user account.
 */

'use client'

import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useDeleteUser } from '@/features/admin/hooks'
import { useDialogStore, DIALOG_KEY } from '@/stores/dialog-store'

export const DeleteUserDialog = (): React.ReactNode => {
  const { openDialogs, closeDialog, getDialogData } = useDialogStore()
  const isOpen = openDialogs[DIALOG_KEY.DELETE_USER] ?? false
  const userId = getDialogData<string>(DIALOG_KEY.DELETE_USER)
  const deleteMutation = useDeleteUser()

  return (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={(open) => !open && closeDialog(DIALOG_KEY.DELETE_USER)}
      title="Delete User"
      description="This will soft-delete the user and revoke all access. This action cannot be easily undone."
      confirmLabel="Delete"
      variant="destructive"
      isLoading={deleteMutation.isPending}
      onConfirm={async () => {
        if (!userId) return
        const result = await deleteMutation.mutateAsync(userId)
        if (result.success) closeDialog(DIALOG_KEY.DELETE_USER)
      }}
    />
  )
}
