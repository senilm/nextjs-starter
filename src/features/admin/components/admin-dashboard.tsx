/**
 * @file admin-dashboard.tsx
 * @module features/admin/components/admin-dashboard
 * Admin dashboard container — stats row + charts grid.
 */

'use client'

import { PageHeader } from '@/components/shared/page-header'
import { AdminStats } from '@/features/admin/components/admin-stats'
import { RevenueChart } from '@/features/admin/components/revenue-chart'
import { SubscriptionsChart } from '@/features/admin/components/subscriptions-chart'
import { SignupsChart } from '@/features/admin/components/signups-chart'

export const AdminDashboard = (): React.ReactNode => {
  return (
    <div className="space-y-6">
      <PageHeader title="Admin Overview" description="Platform metrics and analytics at a glance." />
      <AdminStats />
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart />
        <SubscriptionsChart />
      </div>
      <SignupsChart />
    </div>
  )
}
