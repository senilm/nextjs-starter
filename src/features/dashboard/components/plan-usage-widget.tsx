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
import { CardWithHeaderSkeleton } from '@/components/shared/loading-skeleton'
import { LoadingTransition } from '@/components/shared/loading-transition'
import { paths } from '@/lib/paths'
import { useDashboardStats } from '@/features/dashboard/hooks'
import { useSubscription } from '@/features/billing/hooks'

export const PlanUsageWidget = (): React.ReactNode => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: subscription, isLoading: subLoading } = useSubscription()

  const isLoading = statsLoading || subLoading

  return (
    <LoadingTransition
      isLoading={isLoading || !stats || !subscription}
      loader={<CardWithHeaderSkeleton contentLines={4} />}
    >
      {stats && subscription && (
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
                    {stats.totalProjects} / {subscription.limits.projects ?? 3}
                  </span>
                </div>
                <Progress value={Math.round((stats.totalProjects / (subscription.limits.projects ?? 3)) * 100)} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Storage</span>
                  <span className="font-medium">
                    {stats.storageUsed} GB / {subscription.limits.storage ?? 1} GB
                  </span>
                </div>
                <Progress value={Math.round((stats.storageUsed / (subscription.limits.storage ?? 1)) * 100)} />
              </div>
              {subscription.planKey === 'free' && (
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
      )}
    </LoadingTransition>
  )
}
