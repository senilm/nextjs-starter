/**
 * @file dashboard-stats.tsx
 * @module features/dashboard/components/dashboard-stats
 * Four stats cards row for the dashboard home page with trend indicators.
 */

'use client'

import { FolderKanban, Activity, HardDrive, TrendingUp } from 'lucide-react'

import { StatsCard } from '@/components/shared/stats-card'
import { StatsRowSkeleton } from '@/components/shared/loading-skeleton'
import { LoadingTransition } from '@/components/shared/loading-transition'
import { useDashboardStats } from '@/features/dashboard/hooks'
import { STAT_TRENDS } from '@/features/dashboard/constants'

export const DashboardStats = (): React.ReactNode => {
  const { data: stats, isLoading } = useDashboardStats()

  return (
    <LoadingTransition isLoading={isLoading || !stats} loader={<StatsRowSkeleton />}>
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Projects"
            value={stats.totalProjects}
            icon={FolderKanban}
            trend={STAT_TRENDS.totalProjects}
          />
          <StatsCard
            title="Active Projects"
            value={stats.activeProjects}
            icon={Activity}
            trend={STAT_TRENDS.activeProjects}
          />
          <StatsCard
            title="Storage Used"
            value={`${stats.storageUsed} / ${stats.storageLimit} GB`}
            icon={HardDrive}
            trend={STAT_TRENDS.storageUsed}
          />
          <StatsCard
            title="Plan Usage"
            value={`${stats.totalProjects} projects`}
            icon={TrendingUp}
            trend={STAT_TRENDS.planUsage}
          />
        </div>
      )}
    </LoadingTransition>
  )
}
