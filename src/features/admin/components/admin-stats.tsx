/**
 * @file admin-stats.tsx
 * @module features/admin/components/admin-stats
 * Admin stats row — Total Users, Active Subscriptions, MRR, New Signups (7d).
 */

'use client'

import { Users, CreditCard, DollarSign, UserPlus } from 'lucide-react'

import { StatsCard } from '@/components/shared/stats-card'
import { StatsRowSkeleton } from '@/components/shared/loading-skeleton'
import { LoadingTransition } from '@/components/shared/loading-transition'
import { useAdminStats } from '@/features/admin/hooks'

export const AdminStats = (): React.ReactNode => {
  const { data: stats, isLoading } = useAdminStats()

  return (
    <LoadingTransition isLoading={isLoading || !stats} loader={<StatsRowSkeleton />}>
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={Users}
            trend={{ value: stats.usersTrend, label: 'vs last week' }}
          />
          <StatsCard
            title="Active Subscriptions"
            value={stats.activeSubscriptions.toLocaleString()}
            icon={CreditCard}
            trend={{ value: stats.subscriptionsTrend, label: 'vs last month' }}
          />
          <StatsCard
            title="MRR"
            value={`$${stats.mrr.toLocaleString()}`}
            icon={DollarSign}
            trend={{ value: stats.mrrTrend, label: 'vs last month' }}
          />
          <StatsCard
            title="New Signups (7d)"
            value={stats.newSignups7d.toLocaleString()}
            icon={UserPlus}
            trend={{ value: stats.signupsTrend, label: 'vs prev 7d' }}
          />
        </div>
      )}
    </LoadingTransition>
  )
}
