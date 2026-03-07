/**
 * @file loading-skeleton.tsx
 * @module components/shared/loading-skeleton
 * Reusable skeleton loaders for tables, cards, charts, and common layouts.
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/* ── Table ─────────────────────────────────────────────────────────── */

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

/* ── Stats card / row ──────────────────────────────────────────────── */

export const CardSkeleton = (): React.ReactNode => {
  return (
    <div className="rounded-xl border p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-7 w-12" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="bg-primary/10 size-9 rounded-lg" />
      </div>
    </div>
  )
}

interface StatsRowSkeletonProps {
  count?: number
}

const STATS_GRID_COLS: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
  5: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
}

export const StatsRowSkeleton = ({ count = 4 }: StatsRowSkeletonProps): React.ReactNode => {
  const colClass = STATS_GRID_COLS[count] ?? 'sm:grid-cols-2 lg:grid-cols-4'

  return (
    <div className={cn('grid gap-4', colClass)}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={`stat-${i}`} />
      ))}
    </div>
  )
}

/* ── Grid card (DataTable grid view) ───────────────────────────────── */

export const GridCardSkeleton = (): React.ReactNode => {
  return (
    <div className="rounded-xl border p-4 shadow-sm space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex items-center gap-2 pt-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  )
}

/* ── Chart ─────────────────────────────────────────────────────────── */

interface ChartSkeletonProps {
  height?: string
}

export const ChartSkeleton = ({ height = 'h-[300px]' }: ChartSkeletonProps): React.ReactNode => {
  return <Skeleton className={cn(height, 'w-full')} />
}

/* ── Repeating blocks ──────────────────────────────────────────────── */

interface BlocksSkeletonProps {
  count?: number
  height?: string
  gap?: string
}

export const BlocksSkeleton = ({
  count = 3,
  height = 'h-16',
  gap = 'space-y-3',
}: BlocksSkeletonProps): React.ReactNode => {
  return (
    <div className={gap}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={`block-${i}`} className={cn(height, 'w-full')} />
      ))}
    </div>
  )
}

/* ── Card with header ──────────────────────────────────────────────── */

interface CardWithHeaderSkeletonProps {
  contentLines?: number
  contentClassName?: string
}

export const CardWithHeaderSkeleton = ({
  contentLines = 2,
  contentClassName,
}: CardWithHeaderSkeletonProps): React.ReactNode => {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className={cn('space-y-4', contentClassName)}>
        {Array.from({ length: contentLines }).map((_, i) => (
          <Skeleton key={`content-${i}`} className="h-6 w-full" />
        ))}
      </CardContent>
    </Card>
  )
}

/* ── List items (label + subtitle + trailing) ──────────────────────── */

interface ListSkeletonProps {
  count?: number
}

export const ListSkeleton = ({ count = 3 }: ListSkeletonProps): React.ReactNode => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={`list-${i}`} className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  )
}

/* ── Detail panel (stacked sections) ───────────────────────────────── */

export const DetailPanelSkeleton = (): React.ReactNode => {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  )
}
