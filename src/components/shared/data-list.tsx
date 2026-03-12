/**
 * @file data-list.tsx
 * @module components/shared/data-list
 * Key-value grid for detail/overview pages. Auto-filters empty values.
 */

import { cn } from '@/lib/utils'

interface DataListItem {
  label: string
  value: React.ReactNode
}

interface DataListProps {
  items: DataListItem[]
  className?: string
}

export const DataList = ({ items, className }: DataListProps): React.ReactNode => {
  const visibleItems = items.filter((item) => {
    if (item.value === undefined || item.value === null) return false
    if (typeof item.value === 'string') return item.value.trim() !== ''
    if (typeof item.value === 'number') return true
    return true
  })

  if (visibleItems.length === 0) return null

  return (
    <dl className={cn('grid grid-cols-2 gap-x-4 gap-y-3 text-sm break-words', className)}>
      {visibleItems.map((item) => (
        <div key={item.label} className="contents">
          <dt className="text-muted-foreground">{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
