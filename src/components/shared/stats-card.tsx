/**
 * @file stats-card.tsx
 * @module components/shared/stats-card
 * Stats card with icon, title, value, optional trend indicator, hover micro-interactions, and alert variant.
 */

'use client'

import { TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  iconColor?: string
  trend?: { value: string; label: string; isPositive: boolean }
  subtitle?: string
  variant?: 'default' | 'alert'
  className?: string
}

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  iconColor,
  trend,
  subtitle,
  variant = 'default',
  className,
}: StatsCardProps): React.ReactNode => {
  const isAlert = variant === 'alert'

  return (
    <Card
      className={cn(
        'group relative overflow-hidden py-0 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
        isAlert && 'border-destructive/20 bg-destructive/5',
        className,
      )}
    >
      {/* Accent bar on hover */}
      <div className="absolute left-0 top-0 h-full w-0.5 bg-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <p
            className={cn(
              'text-sm font-medium text-muted-foreground',
              isAlert && 'text-destructive',
            )}
          >
            {title}
          </p>
          {Icon && (
            <Icon
              className={cn(
                'size-4 transition-transform duration-200 group-hover:scale-110',
                iconColor ?? (isAlert ? 'text-destructive' : 'text-muted-foreground/60'),
              )}
            />
          )}
        </div>
        <p
          className={cn(
            'text-2xl font-bold leading-9 tracking-tight',
            isAlert && 'text-destructive',
          )}
        >
          {value}
        </p>
        <div className="flex items-center gap-1 text-xs">
          {trend ? (
            <>
              {trend.isPositive ? (
                <TrendingUp className="size-3 text-emerald-600" />
              ) : (
                <TrendingDown className="size-3 text-red-600" />
              )}
              <span className={trend.isPositive ? 'text-emerald-600' : 'text-red-600'}>
                {trend.value}
              </span>
              <span className="text-muted-foreground">{trend.label}</span>
            </>
          ) : subtitle ? (
            <span className="text-muted-foreground">{subtitle}</span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
