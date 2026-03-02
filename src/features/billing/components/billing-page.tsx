/**
 * @file billing-page.tsx
 * @module features/billing/components/billing-page
 * Billing page container with plan card and usage bars.
 */

'use client'

import { PageHeader } from '@/components/shared/page-header'
import { PlanCard } from '@/features/billing/components/plan-card'
import { UsageBars } from '@/features/billing/components/usage-bars'

export const BillingPage = (): React.ReactNode => {
  return (
    <div className="space-y-8">
      <PageHeader title="Billing" description="Manage your subscription and view usage." />
      <div className="grid gap-6">
        <PlanCard />
        <UsageBars />
      </div>
    </div>
  )
}
