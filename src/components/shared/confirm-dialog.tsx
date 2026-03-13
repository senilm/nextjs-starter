/**
 * @file confirm-dialog.tsx
 * @module components/shared/confirm-dialog
 * Confirmation dialog with loading state and destructive variant support.
 * Built on top of DialogShell for consistent layout.
 */

'use client'

import { Button } from '@/components/ui/button'
import { DialogShell, DialogFooter } from '@/components/shared/dialog-shell'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'destructive'
  onConfirm: () => void | Promise<void>
  isLoading?: boolean
}

export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  isLoading = false,
}: ConfirmDialogProps): React.ReactNode => {
  return (
    <DialogShell
      open={open}
      onOpenChange={(o) => !isLoading && onOpenChange(o)}
      title={title}
      description={typeof description === 'string' ? description : undefined}
    >
      {typeof description !== 'string' && (
        <div className="px-6 py-4 text-sm text-muted-foreground">{description}</div>
      )}
      <DialogFooter>
        <Button variant="outline" disabled={isLoading} onClick={() => onOpenChange(false)}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant}
          onClick={onConfirm}
          loading={isLoading}
          disabled={isLoading}
        >
          {confirmLabel}
        </Button>
      </DialogFooter>
    </DialogShell>
  )
}
