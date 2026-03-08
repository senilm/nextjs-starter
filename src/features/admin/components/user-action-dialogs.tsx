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
  return (
    <>
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
    </>
  )
}
