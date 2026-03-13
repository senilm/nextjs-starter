/**
 * @file suspend-user-dialog.tsx
 * @module features/admin/components/suspend-user-dialog
 * Confirmation dialog for suspending a user account.
 */

'use client'

import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useSuspendUser } from '@/features/admin/hooks'
import { useDialogStore, DIALOG_KEY } from '@/stores/dialog-store'

export const SuspendUserDialog = (): React.ReactNode => {
  const { openDialogs, closeDialog, getDialogData } = useDialogStore()
  const isOpen = openDialogs[DIALOG_KEY.SUSPEND_USER] ?? false
  const userId = getDialogData<string>(DIALOG_KEY.SUSPEND_USER)
  const suspendMutation = useSuspendUser()

  return (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={(open) => !open && closeDialog(DIALOG_KEY.SUSPEND_USER)}
      title="Suspend User"
      description="This will prevent the user from signing in and revoke all active sessions."
      confirmLabel="Suspend"
      isLoading={suspendMutation.isPending}
      onConfirm={async () => {
        if (!userId) return
        const result = await suspendMutation.mutateAsync(userId)
        if (result.success) closeDialog(DIALOG_KEY.SUSPEND_USER)
      }}
    />
  )
}
