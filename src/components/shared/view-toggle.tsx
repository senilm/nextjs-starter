/**
 * @file view-toggle.tsx
 * @module components/shared/view-toggle
 * List/Grid segmented toggle for switching DataTable view modes.
 */

'use client'

import { LayoutGrid, List } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { VIEW_MODE, type ViewMode } from '@/types/data-table'

interface ViewToggleProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export const ViewToggle = ({
  viewMode,
  onViewModeChange,
}: ViewToggleProps): React.ReactNode => {
  return (
    <div className="flex items-center rounded-md border">
      <Button
        variant={viewMode === VIEW_MODE.LIST ? 'secondary' : 'ghost'}
        size="icon-sm"
        onClick={() => onViewModeChange(VIEW_MODE.LIST)}
        aria-label="List view"
      >
        <List className="size-4" />
      </Button>
      <Button
        variant={viewMode === VIEW_MODE.GRID ? 'secondary' : 'ghost'}
        size="icon-sm"
        onClick={() => onViewModeChange(VIEW_MODE.GRID)}
        aria-label="Grid view"
      >
        <LayoutGrid className="size-4" />
      </Button>
    </div>
  )
}
