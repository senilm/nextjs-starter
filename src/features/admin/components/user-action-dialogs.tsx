/**
 * @file user-action-dialogs.tsx
 * @module features/admin/components/user-action-dialogs
 * Confirmation dialogs for user management actions — delete, suspend, unsuspend, change role.
 */

'use client'

import type { UseMutationResult } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import type { ActionResult } from '@/features/admin/types'

interface RoleOption {
  id: string
  name: string
}

interface UserActionDialogsProps {
  deleteUserId: string | null
  setDeleteUserId: (id: string | null) => void
  deleteMutation: UseMutationResult<ActionResult, Error, string>
  suspendUserId: string | null
  setSuspendUserId: (id: string | null) => void
  suspendMutation: UseMutationResult<ActionResult, Error, string>
  unsuspendUserId: string | null
  setUnsuspendUserId: (id: string | null) => void
  unsuspendMutation: UseMutationResult<ActionResult, Error, string>
  changeRoleUserId: string | null
  setChangeRoleUserId: (id: string | null) => void
  selectedRoleId: string
  setSelectedRoleId: (id: string) => void
  changeRoleMutation: UseMutationResult<ActionResult, Error, { userId: string; roleId: string }>
  roles: RoleOption[] | undefined
}

export const UserActionDialogs = ({
  deleteUserId,
  setDeleteUserId,
  deleteMutation,
  suspendUserId,
  setSuspendUserId,
  suspendMutation,
  unsuspendUserId,
  setUnsuspendUserId,
  unsuspendMutation,
  changeRoleUserId,
  setChangeRoleUserId,
  selectedRoleId,
  setSelectedRoleId,
  changeRoleMutation,
  roles,
}: UserActionDialogsProps): React.ReactNode => {
  const handleChangeRole = async (): Promise<void> => {
    if (!changeRoleUserId || !selectedRoleId) return
    const result = await changeRoleMutation.mutateAsync({ userId: changeRoleUserId, roleId: selectedRoleId })
    if (result.success) {
      setChangeRoleUserId(null)
      setSelectedRoleId('')
    }
  }

  return (
    <>
      <ConfirmDialog
        open={!!deleteUserId}
        onOpenChange={(open) => !open && setDeleteUserId(null)}
        title="Delete User"
        description="This will soft-delete the user and revoke all access. This action cannot be easily undone."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={async () => {
          if (!deleteUserId) return
          const result = await deleteMutation.mutateAsync(deleteUserId)
          if (result.success) setDeleteUserId(null)
        }}
      />

      <ConfirmDialog
        open={!!suspendUserId}
        onOpenChange={(open) => !open && setSuspendUserId(null)}
        title="Suspend User"
        description="This will prevent the user from signing in and revoke all active sessions."
        confirmLabel="Suspend"
        isLoading={suspendMutation.isPending}
        onConfirm={async () => {
          if (!suspendUserId) return
          const result = await suspendMutation.mutateAsync(suspendUserId)
          if (result.success) setSuspendUserId(null)
        }}
      />

      <ConfirmDialog
        open={!!unsuspendUserId}
        onOpenChange={(open) => !open && setUnsuspendUserId(null)}
        title="Unsuspend User"
        description="This will restore the user's access to the platform."
        confirmLabel="Unsuspend"
        isLoading={unsuspendMutation.isPending}
        onConfirm={async () => {
          if (!unsuspendUserId) return
          const result = await unsuspendMutation.mutateAsync(unsuspendUserId)
          if (result.success) setUnsuspendUserId(null)
        }}
      />

      <Dialog
        open={!!changeRoleUserId}
        onOpenChange={(open) => !open && !changeRoleMutation.isPending && setChangeRoleUserId(null)}
      >
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
            <Button variant="outline" disabled={changeRoleMutation.isPending} onClick={() => setChangeRoleUserId(null)}>
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
        </DialogContent>
      </Dialog>
    </>
  )
}
