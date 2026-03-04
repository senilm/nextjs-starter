/**
 * @file global-dialogs.tsx
 * @module components/shared/global-dialogs
 * Renders globally accessible dialogs controlled by the dialog store.
 * Dialogs are lazy-loaded and permission-gated.
 */

'use client'

import { lazy, Suspense } from 'react'

import { useDialogStore, DIALOG_KEY } from '@/stores/dialog-store'
import { usePermission } from '@/hooks/use-permission'
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

const InviteUserDialog = lazy(() =>
  import('@/features/admin/components/invite-user-dialog').then((m) => ({
    default: m.InviteUserDialog,
  })),
)

const RoleFormDialog = lazy(() =>
  import('@/features/roles/components/role-form-dialog').then((m) => ({
    default: m.RoleFormDialog,
  })),
)

const EditPlanDialog = lazy(() =>
  import('@/features/admin/components/edit-plan-dialog').then((m) => ({
    default: m.EditPlanDialog,
  })),
)

export const GlobalDialogs = (): React.ReactNode => {
  const { openDialogs, dialogData, closeDialog } = useDialogStore()
  const canCreateProject = usePermission('projects.create')
  const canEditProject = usePermission('projects.edit')
  const canInviteUser = usePermission('users.create')
  const canCreateRole = usePermission('roles.create')
  const canEditRole = usePermission('roles.edit')
  const canEditPlan = usePermission('plans.edit')

  return (
    <Suspense>
      {canCreateProject && openDialogs[DIALOG_KEY.CREATE_PROJECT] && (
        <CreateProjectDialog
          open
          onOpenChange={(open) => !open && closeDialog(DIALOG_KEY.CREATE_PROJECT)}
        />
      )}
      {canEditProject && openDialogs[DIALOG_KEY.EDIT_PROJECT] && (
        <EditProjectDialog
          open
          project={(dialogData[DIALOG_KEY.EDIT_PROJECT] as Project) ?? null}
          onOpenChange={(open) => !open && closeDialog(DIALOG_KEY.EDIT_PROJECT)}
        />
      )}
      {canInviteUser && openDialogs[DIALOG_KEY.INVITE_USER] && (
        <InviteUserDialog
          open
          onOpenChange={(open) => !open && closeDialog(DIALOG_KEY.INVITE_USER)}
        />
      )}
      {canCreateRole && openDialogs[DIALOG_KEY.CREATE_ROLE] && (
        <RoleFormDialog
          open
          role={null}
          onOpenChange={(open) => !open && closeDialog(DIALOG_KEY.CREATE_ROLE)}
        />
      )}
      {canEditRole && openDialogs[DIALOG_KEY.EDIT_ROLE] && (
        <RoleFormDialog
          open
          role={(dialogData[DIALOG_KEY.EDIT_ROLE] as RoleWithPermissions) ?? null}
          onOpenChange={(open) => !open && closeDialog(DIALOG_KEY.EDIT_ROLE)}
        />
      )}
      {canEditPlan && openDialogs[DIALOG_KEY.EDIT_PLAN] && (
        <EditPlanDialog
          open
          plan={(dialogData[DIALOG_KEY.EDIT_PLAN] as PlanWithStats) ?? null}
          onOpenChange={(open) => !open && closeDialog(DIALOG_KEY.EDIT_PLAN)}
        />
      )}
    </Suspense>
  )
}
