/**
 * @file loading-skeleton.tsx
 * @module components/shared/loading-skeleton
 * Reusable skeleton loaders for tables, cards, and stats rows.
 */

import { Skeleton } from '@/components/ui/skeleton'

interface TableSkeletonProps {
  rows?: number
  columns?: number
}

export const TableSkeleton = ({ rows = 5, columns = 4 }: TableSkeletonProps): React.ReactNode => {
  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-8 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={`row-${i}`} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={`cell-${i}-${j}`} className="h-10 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export const CardSkeleton = (): React.ReactNode => {
  return (
    <div className="rounded-lg border p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="size-12 rounded-lg" />
      </div>
    </div>
  )
}

interface StatsRowSkeletonProps {
  count?: number
}

export const StatsRowSkeleton = ({ count = 4 }: StatsRowSkeletonProps): React.ReactNode => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={`stat-${i}`} />
      ))}
    </div>
  )
}
