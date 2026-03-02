/**
 * @file delete-project-dialog.tsx
 * @module features/projects/components/delete-project-dialog
 * Alert dialog for soft-delete confirmation.
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
import { useDeleteProject } from '@/features/projects/hooks'
import type { Project } from '@/features/projects/types'

interface DeleteProjectDialogProps {
  project: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const DeleteProjectDialog = ({ project, open, onOpenChange }: DeleteProjectDialogProps): React.ReactNode => {
  const deleteProjectMutation = useDeleteProject()

  const handleDelete = async (): Promise<void> => {
    if (!project) return
    await deleteProjectMutation.mutateAsync(project.id)
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete project</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{project?.name}</strong>? This action can be undone by an
            administrator.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteProjectMutation.isPending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {deleteProjectMutation.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
