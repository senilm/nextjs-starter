/**
 * @file usage-page.tsx
 * @module features/billing/components/usage-page
 * Usage page showing resource consumption against plan limits with upgrade CTA.
 */

'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { PageHeader } from '@/components/shared/page-header'
import { CardWithHeaderSkeleton } from '@/components/shared/loading-skeleton'
import { LoadingTransition } from '@/components/shared/loading-transition'
import { paths } from '@/lib/paths'
import { useDashboardStats } from '@/features/dashboard/hooks'
import { useSubscription } from '@/features/billing/hooks'

export const UsagePage = (): React.ReactNode => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: subscription, isLoading: subLoading } = useSubscription()

  const isLoading = statsLoading || subLoading

  const projectsUsed = stats?.totalProjects ?? 0
  const projectsLimit = subscription?.limits.projects ?? 3
  const projectsPercent = Math.min(Math.round((projectsUsed / projectsLimit) * 100), 100)

  const storageUsed = stats?.storageUsed ?? 0
  const storageLimit = subscription?.limits.storage ?? 1
  const storagePercent = Math.min(Math.round((storageUsed / storageLimit) * 100), 100)

  return (
    <div className="space-y-8">
      <PageHeader title="Usage" description="Track your resource usage against plan limits." />
      <LoadingTransition
        isLoading={isLoading}
        loader={<CardWithHeaderSkeleton contentLines={4} contentClassName="space-y-6" />}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="grid gap-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Resource Usage</CardTitle>
              <CardDescription>
                You are on the {subscription?.planName ?? 'Free'} plan.
              </CardDescription>
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

          {subscription?.planKey === 'free' && (
            <Card>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Need more resources?</p>
                  <p className="text-sm text-muted-foreground">
                    Upgrade your plan to unlock higher limits.
                  </p>
                </div>
                <Button asChild>
                  <Link href={paths.dashboard.billing()}>
                    Upgrade Plan
                    <ArrowUpRight className="ml-1 size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </LoadingTransition>
    </div>
  )
}
