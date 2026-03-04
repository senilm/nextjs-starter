/**
 * @file stats-card.tsx
 * @module components/shared/stats-card
 * Animated stats card with icon, title, value, and optional trend.
 */

'use client'

import { type LucideIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: { value: number; label: string }
  className?: string
}

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  className,
}: StatsCardProps): React.ReactNode => {
  return (
    <Card className={cn('relative overflow-hidden py-0', className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium">{title}</p>
            <p className="text-xl font-bold">{value}</p>
            {trend && (
              <p
                className={cn(
                  'text-xs font-medium',
                  trend.value >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400',
                )}
              >
                {trend.value >= 0 ? '+' : ''}
                {trend.value}% {trend.label}
              </p>
            )}
          </div>
          <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
            <Icon className="size-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
