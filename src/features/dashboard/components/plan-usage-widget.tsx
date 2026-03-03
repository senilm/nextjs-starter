/**
 * @file plan-usage-widget.tsx
 * @module features/dashboard/components/plan-usage-widget
 * Plan usage widget showing project and storage consumption with upgrade CTA.
 */

'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { paths } from '@/lib/paths'
import { useDashboardStats } from '@/features/dashboard/hooks'
import { useSubscription } from '@/features/billing/hooks'

export const PlanUsageWidget = (): React.ReactNode => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: subscription, isLoading: subLoading } = useSubscription()

  const isLoading = statsLoading || subLoading

  if (isLoading || !stats || !subscription) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-2 w-full" />
        </CardContent>
      </Card>
    )
  }

  const projectPercent = Math.round((stats.totalProjects / subscription.limits.projects) * 100)
  const storagePercent = Math.round((stats.storageUsed / subscription.limits.storage) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut', delay: 0.15 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Plan Usage</CardTitle>
          <Badge variant="secondary">{subscription.planName}</Badge>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Projects</span>
              <span className="font-medium">
                {stats.totalProjects} / {subscription.limits.projects}
              </span>
            </div>
            <Progress value={projectPercent} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Storage</span>
              <span className="font-medium">
                {stats.storageUsed} GB / {subscription.limits.storage} GB
              </span>
            </div>
            <Progress value={storagePercent} />
          </div>
          {subscription.plan === 'free' && (
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href={paths.dashboard.billing()}>
                Upgrade Plan
                <ArrowUpRight className="ml-1 size-4" />
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
