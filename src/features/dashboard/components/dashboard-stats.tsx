/**
 * @file dashboard-stats.tsx
 * @module features/dashboard/components/dashboard-stats
 * Four stats cards row for the dashboard home page.
 */

'use client'

import { FolderKanban, Activity, HardDrive, TrendingUp } from 'lucide-react'

import { StatsCard } from '@/components/shared/stats-card'
import { StatsRowSkeleton } from '@/components/shared/loading-skeleton'
import { useDashboardStats } from '@/features/dashboard/hooks'

export const DashboardStats = (): React.ReactNode => {
  const { data: stats, isLoading } = useDashboardStats()

  if (isLoading || !stats) return <StatsRowSkeleton />

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard title="Total Projects" value={stats.totalProjects} icon={FolderKanban} />
      <StatsCard title="Active Projects" value={stats.activeProjects} icon={Activity} />
      <StatsCard
        title="Storage Used"
        value={`${stats.storageUsed} / ${stats.storageLimit} GB`}
        icon={HardDrive}
      />
      <StatsCard title="Plan Usage" value={`${stats.totalProjects} projects`} icon={TrendingUp} />
    </div>
  )
}
