/**
 * @file data-table-toolbar.tsx
 * @module components/data-table/data-table-toolbar
 * Toolbar with search input, refresh button, and slot for children.
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { RefreshCw, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const MIN_SPIN_MS = 600

interface DataTableToolbarProps {
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  onRefresh?: () => void
  isRefreshing?: boolean
  columnCustomizer?: ReactNode
  children?: ReactNode
}

export const DataTableToolbar = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  onRefresh,
  isRefreshing,
  columnCustomizer,
  children,
}: DataTableToolbarProps): React.ReactNode => {
  const [spinning, setSpinning] = useState(false)
  const spinStart = useRef(0)

  useEffect(() => {
    if (isRefreshing) {
      spinStart.current = Date.now()
      setSpinning(true)
      return
    }
    if (spinning) {
      const elapsed = Date.now() - spinStart.current
      const remaining = Math.max(0, MIN_SPIN_MS - elapsed)
      const timer = setTimeout(() => setSpinning(false), remaining)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [isRefreshing, spinning])

  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex flex-1 items-center gap-2">
        {onSearchChange && (
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={spinning}>
            <RefreshCw className={cn('h-4 w-4', spinning && 'animate-spin')} />
          </Button>
        )}
        {children}
        {columnCustomizer}
      </div>
    </div>
  )
}
