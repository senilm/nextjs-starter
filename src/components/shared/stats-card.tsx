/**
 * @file stats-card.tsx
 * @module components/shared/stats-card
 * Animated stats card with icon, title, value, and optional trend.
 */

'use client'

import { motion } from 'motion/react'
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

export const StatsCard = ({ title, value, icon: Icon, trend, className }: StatsCardProps): React.ReactNode => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <Card className={cn('relative overflow-hidden', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
              {trend && (
                <p
                  className={cn(
                    'text-xs font-medium',
                    trend.value >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
                  )}
                >
                  {trend.value >= 0 ? '+' : ''}
                  {trend.value}% {trend.label}
                </p>
              )}
            </div>
            <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
