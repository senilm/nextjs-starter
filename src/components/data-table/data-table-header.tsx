/**
 * @file data-table-header.tsx
 * @module components/data-table/data-table-header
 * Sortable column header with tri-state sort indicators.
 */

'use client'

import type { Column } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DataTableHeaderProps<TData, TValue> {
  column: Column<TData, TValue>
  title: string
  className?: string
}

export const DataTableHeader = <TData, TValue>({
  column,
  title,
  className,
}: DataTableHeaderProps<TData, TValue>): React.ReactNode => {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <span>{title}</span>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label={`Sort by ${title}`}
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        {column.getIsSorted() === 'desc' ? (
          <ArrowDown />
        ) : column.getIsSorted() === 'asc' ? (
          <ArrowUp />
        ) : (
          <ArrowUpDown className="text-muted-foreground/50" />
        )}
      </Button>
    </div>
  )
}
