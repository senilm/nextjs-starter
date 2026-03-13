/**
 * @file delete-project-dialog.tsx
 * @module features/projects/components/delete-project-dialog
 * Confirmation dialog for deleting a project.
 */

'use client'

import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useDeleteProject } from '@/features/projects/hooks'
import { useDialogStore, DIALOG_KEY } from '@/stores/dialog-store'

interface DeleteProjectData {
  id: string
  name: string
}

export const DeleteProjectDialog = (): React.ReactNode => {
  const { openDialogs, closeDialog, getDialogData } = useDialogStore()
  const isOpen = openDialogs[DIALOG_KEY.DELETE_PROJECT] ?? false
  const project = getDialogData<DeleteProjectData>(DIALOG_KEY.DELETE_PROJECT)
  const deleteProjectMutation = useDeleteProject()

  return (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={(open) => !open && closeDialog(DIALOG_KEY.DELETE_PROJECT)}
      title="Delete project"
      description={`Are you sure you want to delete "${project?.name}"? This action can be undone by an administrator.`}
      confirmLabel="Delete"
      variant="destructive"
      isLoading={deleteProjectMutation.isPending}
      onConfirm={async () => {
        if (!project) return
        await deleteProjectMutation.mutateAsync(project.id)
        closeDialog(DIALOG_KEY.DELETE_PROJECT)
      }}
    />
  )
}
