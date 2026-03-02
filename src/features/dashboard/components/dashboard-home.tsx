/**
 * @file dashboard-home.tsx
 * @module features/dashboard/components/dashboard-home
 * Main dashboard home with stats, activity chart, projects, plan usage, and quick actions.
 */

'use client'

import { PageHeader } from '@/components/shared/page-header'
import { DashboardStats } from '@/features/dashboard/components/dashboard-stats'
import { ActivityChart } from '@/features/dashboard/components/activity-chart'
import { RecentProjects } from '@/features/dashboard/components/recent-projects'
import { PlanUsageWidget } from '@/features/dashboard/components/plan-usage-widget'
import { QuickActions } from '@/features/dashboard/components/quick-actions'

export const DashboardHome = (): React.ReactNode => {
  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description="Welcome back! Here's an overview of your account." />
      <DashboardStats />
      <ActivityChart />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentProjects />
        </div>
        <div className="space-y-6">
          <PlanUsageWidget />
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  )
}
