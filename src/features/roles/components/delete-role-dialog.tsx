/**
 * @file delete-role-dialog.tsx
 * @module features/roles/components/delete-role-dialog
 * Confirmation dialog for deleting a role — blocked if system role or has users.
 */

'use client'

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
import { useDeleteRole } from '@/features/roles/hooks'
import type { RoleWithPermissions } from '@/features/roles/types'

interface DeleteRoleDialogProps {
  role: RoleWithPermissions | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const DeleteRoleDialog = ({ role, open, onOpenChange }: DeleteRoleDialogProps): React.ReactNode => {
  const deleteMutation = useDeleteRole()

  const isBlocked = role?.isSystem || (role?.userCount ?? 0) > 0
  const blockReason = role?.isSystem
    ? 'System roles cannot be deleted.'
    : (role?.userCount ?? 0) > 0
      ? `This role has ${role?.userCount} assigned user(s). Reassign them before deleting.`
      : null

  const handleDelete = (): void => {
    if (role && !isBlocked) {
      deleteMutation.mutate(role.id)
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Role</AlertDialogTitle>
          <AlertDialogDescription>
            {isBlocked
              ? blockReason
              : `Are you sure you want to delete "${role?.name}"? This action cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {!isBlocked && (
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
