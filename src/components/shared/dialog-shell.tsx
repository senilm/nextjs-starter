/**
 * @file dialog-shell.tsx
 * @module components/shared/dialog-shell
 * Standardized dialog layout — shell with bordered header/footer, padded body.
 * Used by all dialogs across the app for visual consistency.
 */

'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface DialogShellProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export const DialogShell = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: DialogShellProps): React.ReactNode => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className={cn('gap-0 p-0', className)} showCloseButton={false}>
      <DialogHeader className="border-b px-6 pt-6 pb-4">
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogHeader>
      {children}
    </DialogContent>
  </Dialog>
)

interface DialogBodyProps {
  children: React.ReactNode
  className?: string
}

export const DialogBody = ({
  children,
  className,
}: DialogBodyProps): React.ReactNode => (
  <div className={cn('px-6 py-6', className)}>{children}</div>
)

interface DialogFooterProps {
  children: React.ReactNode
  className?: string
}

export const DialogFooter = ({
  children,
  className,
}: DialogFooterProps): React.ReactNode => (
  <div className={cn('flex justify-end gap-2 border-t px-6 py-4', className)}>{children}</div>
)
