/**
 * @file unsuspend-user-dialog.tsx
 * @module features/admin/components/unsuspend-user-dialog
 * Confirmation dialog for restoring a suspended user's access.
 */

'use client'

import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useUnsuspendUser } from '@/features/admin/hooks'
import { useDialogStore, DIALOG_KEY } from '@/stores/dialog-store'

export const UnsuspendUserDialog = (): React.ReactNode => {
  const { openDialogs, closeDialog, getDialogData } = useDialogStore()
  const isOpen = openDialogs[DIALOG_KEY.UNSUSPEND_USER] ?? false
  const userId = getDialogData<string>(DIALOG_KEY.UNSUSPEND_USER)
  const unsuspendMutation = useUnsuspendUser()

  return (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={(open) => !open && closeDialog(DIALOG_KEY.UNSUSPEND_USER)}
      title="Unsuspend User"
      description="This will restore the user's access to the platform."
      confirmLabel="Unsuspend"
      isLoading={unsuspendMutation.isPending}
      onConfirm={async () => {
        if (!userId) return
        const result = await unsuspendMutation.mutateAsync(userId)
        if (result.success) closeDialog(DIALOG_KEY.UNSUSPEND_USER)
      }}
    />
  )
}
