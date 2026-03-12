/**
 * @file form-dialog.tsx
 * @module components/shared/form-dialog
 * Standardized dialog layout for form dialogs — shell, body, and footer.
 */

'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface FormDialogShellProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  className?: string
}

export const FormDialogShell = ({
  open,
  onOpenChange,
  title,
  children,
  className,
}: FormDialogShellProps): React.ReactNode => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className={cn('gap-0 p-0', className)} showCloseButton={false}>
      <DialogHeader className="border-b px-6 pt-6 pb-4">
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      {children}
    </DialogContent>
  </Dialog>
)

interface FormDialogBodyProps {
  children: React.ReactNode
  className?: string
}

export const FormDialogBody = ({
  children,
  className,
}: FormDialogBodyProps): React.ReactNode => (
  <div className={cn('px-6 py-6', className)}>{children}</div>
)

interface FormDialogFooterProps {
  children: React.ReactNode
}

export const FormDialogFooter = ({
  children,
}: FormDialogFooterProps): React.ReactNode => (
  <div className="flex justify-end gap-2 border-t px-6 py-4">{children}</div>
)
