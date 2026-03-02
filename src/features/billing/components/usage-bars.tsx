/**
 * @file usage-bars.tsx
 * @module features/billing/components/usage-bars
 * Progress bars for project and storage usage against plan limits.
 */

'use client'

import { motion } from 'motion/react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardStats } from '@/features/dashboard/hooks'
import { useSubscription } from '@/features/billing/hooks'

export const UsageBars = (): React.ReactNode => {
  const { data: subscription, isLoading: subLoading } = useSubscription()
  const { data: stats, isLoading: statsLoading } = useDashboardStats()

  const isLoading = subLoading || statsLoading

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </CardContent>
      </Card>
    )
  }

  const projectsUsed = stats?.totalProjects ?? 0
  const projectsLimit = subscription?.limits.projects ?? 3
  const projectsPercent = Math.min(Math.round((projectsUsed / projectsLimit) * 100), 100)

  const storageUsed = stats?.storageUsed ?? 0
  const storageLimit = subscription?.limits.storage ?? 1
  const storagePercent = Math.min(Math.round((storageUsed / storageLimit) * 100), 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut', delay: 0.1 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
          <CardDescription>Track your resource usage against plan limits.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Projects</span>
              <span className="text-muted-foreground">
                {projectsUsed} / {projectsLimit}
              </span>
            </div>
            <Progress value={projectsPercent} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Storage</span>
              <span className="text-muted-foreground">
                {storageUsed} GB / {storageLimit} GB
              </span>
            </div>
            <Progress value={storagePercent} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
