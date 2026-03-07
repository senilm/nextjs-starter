/**
 * @file status-badge.tsx
 * @module components/shared/status-badge
 * Semantic badge wrapper with color variants for status indicators.
 */

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const STATUS_VARIANTS = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
  warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
  destructive: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
  info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
  default: 'bg-muted text-muted-foreground border-border',
} as const

type StatusVariant = keyof typeof STATUS_VARIANTS

interface StatusBadgeProps {
  variant?: StatusVariant
  children: React.ReactNode
  className?: string
}

export const StatusBadge = ({
  variant = 'default',
  children,
  className,
}: StatusBadgeProps): React.ReactNode => {
  return (
    <Badge variant="outline" className={cn(STATUS_VARIANTS[variant], className)}>
      {children}
    </Badge>
  )
}
