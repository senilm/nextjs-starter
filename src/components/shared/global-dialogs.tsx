/**
 * @file global-dialogs.tsx
 * @module components/shared/global-dialogs
 * Renders globally accessible dialogs controlled by the dialog store.
 * Dialogs are lazy-loaded. Admin dialogs are permission-gated.
 */

'use client'

import { lazy, Suspense } from 'react'

import { useDialogStore, DIALOG_KEY } from '@/stores/dialog-store'
import { usePermissions } from '@/hooks/use-permission'
import type { Project } from '@/features/projects/types'
import type { RoleWithPermissions } from '@/features/roles/types'
import type { PlanWithStats } from '@/features/admin/types'

const CreateProjectDialog = lazy(() =>
  import('@/features/projects/components/create-project-dialog').then((m) => ({
    default: m.CreateProjectDialog,
  })),
)

const EditProjectDialog = lazy(() =>
  import('@/features/projects/components/edit-project-dialog').then((m) => ({
    default: m.EditProjectDialog,
  })),
)

const DeleteProjectDialog = lazy(() =>
  import('@/features/projects/components/delete-project-dialog').then((m) => ({
    default: m.DeleteProjectDialog,
  })),
)

const InviteUserDialog = lazy(() =>
  import('@/features/admin/components/invite-user-dialog').then((m) => ({
    default: m.InviteUserDialog,
  })),
)

const DeleteUserDialog = lazy(() =>
  import('@/features/admin/components/delete-user-dialog').then((m) => ({
    default: m.DeleteUserDialog,
  })),
)

const SuspendUserDialog = lazy(() =>
  import('@/features/admin/components/suspend-user-dialog').then((m) => ({
    default: m.SuspendUserDialog,
  })),
)

const UnsuspendUserDialog = lazy(() =>
  import('@/features/admin/components/unsuspend-user-dialog').then((m) => ({
    default: m.UnsuspendUserDialog,
  })),
)

const ChangeUserRoleDialog = lazy(() =>
  import('@/features/admin/components/change-user-role-dialog').then((m) => ({
    default: m.ChangeUserRoleDialog,
  })),
)

const UserDetailSheet = lazy(() =>
  import('@/features/admin/components/user-detail-sheet').then((m) => ({
    default: m.UserDetailSheet,
  })),
)

const RoleFormDialog = lazy(() =>
  import('@/features/roles/components/role-form-dialog').then((m) => ({
    default: m.RoleFormDialog,
  })),
)

const DeleteRoleDialog = lazy(() =>
  import('@/features/roles/components/delete-role-dialog').then((m) => ({
    default: m.DeleteRoleDialog,
  })),
)

const EditPlanDialog = lazy(() =>
  import('@/features/admin/components/edit-plan-dialog').then((m) => ({
    default: m.EditPlanDialog,
  })),
)

export const GlobalDialogs = (): React.ReactNode => {
  const openDialogs = useDialogStore((s) => s.openDialogs)
  const dialogData = useDialogStore((s) => s.dialogData)
  const closeDialog = useDialogStore((s) => s.closeDialog)
  const perms = usePermissions([
    'users.create',
    'users.edit',
    'users.delete',
    'users.view',
    'roles.create',
    'roles.edit',
    'roles.delete',
    'plans.edit',
  ])

  return (
    <Suspense>
      {/* Project dialogs */}
      {openDialogs[DIALOG_KEY.CREATE_PROJECT] && (
        <CreateProjectDialog
          open
          onOpenChange={(open) => !open && closeDialog(DIALOG_KEY.CREATE_PROJECT)}
        />
      )}
      {openDialogs[DIALOG_KEY.EDIT_PROJECT] && (
        <EditProjectDialog
          open
          project={(dialogData[DIALOG_KEY.EDIT_PROJECT] as Project) ?? null}
          onOpenChange={(open) => !open && closeDialog(DIALOG_KEY.EDIT_PROJECT)}
        />
      )}
      {openDialogs[DIALOG_KEY.DELETE_PROJECT] && <DeleteProjectDialog />}

      {/* User dialogs */}
      {perms['users.create'] && openDialogs[DIALOG_KEY.INVITE_USER] && (
        <InviteUserDialog
          open
          onOpenChange={(open) => !open && closeDialog(DIALOG_KEY.INVITE_USER)}
        />
      )}
      {perms['users.delete'] && openDialogs[DIALOG_KEY.DELETE_USER] && <DeleteUserDialog />}
      {perms['users.edit'] && openDialogs[DIALOG_KEY.SUSPEND_USER] && <SuspendUserDialog />}
      {perms['users.edit'] && openDialogs[DIALOG_KEY.UNSUSPEND_USER] && <UnsuspendUserDialog />}
      {perms['users.edit'] && openDialogs[DIALOG_KEY.CHANGE_USER_ROLE] && <ChangeUserRoleDialog />}
      {perms['users.view'] && openDialogs[DIALOG_KEY.USER_DETAIL] && <UserDetailSheet />}

      {/* Role dialogs */}
      {perms['roles.create'] && openDialogs[DIALOG_KEY.CREATE_ROLE] && (
        <RoleFormDialog
          open
          role={null}
          onOpenChange={(open) => !open && closeDialog(DIALOG_KEY.CREATE_ROLE)}
        />
      )}
      {perms['roles.edit'] && openDialogs[DIALOG_KEY.EDIT_ROLE] && (
        <RoleFormDialog
          open
          role={(dialogData[DIALOG_KEY.EDIT_ROLE] as RoleWithPermissions) ?? null}
          onOpenChange={(open) => !open && closeDialog(DIALOG_KEY.EDIT_ROLE)}
        />
      )}
      {perms['roles.delete'] && openDialogs[DIALOG_KEY.DELETE_ROLE] && <DeleteRoleDialog />}

      {/* Plan dialogs */}
      {perms['plans.edit'] && openDialogs[DIALOG_KEY.EDIT_PLAN] && (
        <EditPlanDialog
          open
          plan={(dialogData[DIALOG_KEY.EDIT_PLAN] as PlanWithStats) ?? null}
          onOpenChange={(open) => !open && closeDialog(DIALOG_KEY.EDIT_PLAN)}
        />
      )}
    </Suspense>
  )
}
