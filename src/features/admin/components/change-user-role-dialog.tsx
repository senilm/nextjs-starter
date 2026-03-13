/**
 * @file change-user-role-dialog.tsx
 * @module features/admin/components/change-user-role-dialog
 * Dialog for changing a user's role — fetches roles list internally.
 */

'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DialogShell, DialogBody, DialogFooter } from '@/components/shared/dialog-shell'
import { useChangeUserRole } from '@/features/admin/hooks'
import { getRoles } from '@/features/roles/actions'
import { useDialogStore, DIALOG_KEY } from '@/stores/dialog-store'

export const ChangeUserRoleDialog = (): React.ReactNode => {
  const { openDialogs, closeDialog, getDialogData } = useDialogStore()
  const isOpen = openDialogs[DIALOG_KEY.CHANGE_USER_ROLE] ?? false
  const userId = getDialogData<string>(DIALOG_KEY.CHANGE_USER_ROLE)
  const changeRoleMutation = useChangeUserRole()
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const { data: roles } = useQuery({ queryKey: ['roles'], queryFn: () => getRoles() })

  const handleClose = (): void => {
    closeDialog(DIALOG_KEY.CHANGE_USER_ROLE)
    setSelectedRoleId('')
  }

  const handleChangeRole = async (): Promise<void> => {
    if (!userId || !selectedRoleId) return
    const result = await changeRoleMutation.mutateAsync({ userId, roleId: selectedRoleId })
    if (result.success) handleClose()
  }

  return (
    <DialogShell
      open={isOpen}
      onOpenChange={(open) => !open && !changeRoleMutation.isPending && handleClose()}
      title="Change Role"
      description="Select a new role for this user."
    >
      <DialogBody>
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
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" disabled={changeRoleMutation.isPending} onClick={handleClose}>
          Cancel
        </Button>
        <Button
          disabled={!selectedRoleId}
          loading={changeRoleMutation.isPending}
          onClick={() => void handleChangeRole()}
        >
          Save
        </Button>
      </DialogFooter>
    </DialogShell>
  )
}
