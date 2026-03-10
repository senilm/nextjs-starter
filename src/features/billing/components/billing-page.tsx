/**
 * @file billing-page.tsx
 * @module features/billing/components/billing-page
 * Billing page with subscription details, plan selection, usage, and payment history.
 */

'use client'

import { PageHeader } from '@/components/shared/page-header'
import { SubscriptionDetails } from '@/features/billing/components/subscription-details'
import { PlanCard } from '@/features/billing/components/plan-card'
import { PaymentHistory } from '@/features/billing/components/payment-history'

export const BillingPage = (): React.ReactNode => {
  return (
    <div className="space-y-8">
      <PageHeader title="Billing" description="Manage your subscription and view usage." />
      <div className="grid gap-6">
        <SubscriptionDetails />
        <PlanCard />
        <PaymentHistory />
      </div>
    </div>
  )
}
