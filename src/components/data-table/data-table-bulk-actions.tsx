/**
 * @file data-table-bulk-actions.tsx
 * @module components/data-table/data-table-bulk-actions
 * Floating action bar for selected table rows.
 */

'use client'

import { createPortal } from 'react-dom'
import { Trash2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface DataTableBulkActionsProps {
  selectedCount: number
  onDelete?: () => void
  onClear: () => void
}

export const DataTableBulkActions = ({
  selectedCount,
  onDelete,
  onClear,
}: DataTableBulkActionsProps): React.ReactNode => {
  if (selectedCount === 0) return null

  return createPortal(
    <div className="fixed inset-x-0 bottom-6 z-50 mx-auto w-fit animate-in fade-in slide-in-from-bottom-4 duration-300 fill-mode-forwards">
      <div className="flex items-center gap-4 rounded-lg border bg-card px-4 py-2.5 shadow-lg">
        <span className="text-sm font-medium">
          {selectedCount} row{selectedCount !== 1 && 's'} selected
        </span>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex items-center gap-2">
          {onDelete && (
            <Button variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onClear}>
            <X className="mr-1.5 h-3.5 w-3.5" />
            Clear
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
