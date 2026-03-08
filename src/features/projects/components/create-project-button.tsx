/**
 * @file create-project-button.tsx
 * @module features/projects/components/create-project-button
 * Reusable button that opens the create project dialog.
 */

'use client'

import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useDialogStore, DIALOG_KEY } from '@/stores/dialog-store'

export const CreateProjectButton = (): React.ReactNode => {
  const { openDialog } = useDialogStore()

  return (
    <Button size="sm" onClick={() => openDialog(DIALOG_KEY.CREATE_PROJECT)}>
      <Plus className="mr-1 size-4" />
      New Project
    </Button>
  )
}
