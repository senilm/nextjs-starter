/**
 * @file dashboard-home.tsx
 * @module features/dashboard/components/dashboard-home
 * Main dashboard home container with stats, quick actions, and recent projects.
 */

'use client'

import { PageHeader } from '@/components/shared/page-header'
import { DashboardStats } from '@/features/dashboard/components/dashboard-stats'
import { QuickActions } from '@/features/dashboard/components/quick-actions'
import { RecentProjects } from '@/features/dashboard/components/recent-projects'

export const DashboardHome = (): React.ReactNode => {
  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description="Welcome back! Here's an overview of your account." />
      <DashboardStats />
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <QuickActions />
      </div>
      <RecentProjects />
    </div>
  )
}
