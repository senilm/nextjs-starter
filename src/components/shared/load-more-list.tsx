/**
 * @file load-more-list.tsx
 * @module components/shared/load-more-list
 * Generic list with load-more button for paginated data.
 */

'use client'

import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { cn } from '@/lib/utils'

interface LoadMoreListProps<T> {
  items: T[]
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void
  renderItem: (item: T, index: number) => ReactNode
  emptyMessage?: string
  className?: string
}

export const LoadMoreList = <T,>({
  items,
  hasMore,
  isLoading,
  onLoadMore,
  renderItem,
  emptyMessage = 'No items to display.',
  className,
}: LoadMoreListProps<T>): React.ReactNode => {
  if (items.length === 0 && !isLoading) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-2">
        {items.map((item, index) => renderItem(item, index))}
      </div>

      {isLoading && <LoadingSpinner size="sm" className="py-4" />}

      {hasMore && !isLoading && (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={onLoadMore}>
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}
