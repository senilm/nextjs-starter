/**
 * @file billing-page.tsx
 * @module features/billing/components/billing-page
 * Billing page with subscription details, plan selection, usage, and payment history.
 */

'use client'

import { lazy, Suspense } from 'react'

import { PageHeader } from '@/components/shared/page-header'
import { SubscriptionDetails } from '@/features/billing/components/subscription-details'
import { PlanCard } from '@/features/billing/components/plan-card'
import { UsageBars } from '@/features/billing/components/usage-bars'
import { PaymentHistory } from '@/features/billing/components/payment-history'
import { useCheckout } from '@/features/billing/hooks/use-checkout'
import { usePaymentProvider } from '@/features/billing/hooks/use-payment-provider'

const RazorpayCheckoutModal = lazy(() =>
  import('@/features/billing/components/razorpay-checkout-modal').then((m) => ({
    default: m.RazorpayCheckoutModal,
  })),
)

export const BillingPage = (): React.ReactNode => {
  const { provider } = usePaymentProvider()
  const { razorpayConfig, clearRazorpayConfig } = useCheckout()

  return (
    <div className="space-y-8">
      <PageHeader title="Billing" description="Manage your subscription and view usage." />
      <div className="grid gap-6">
        <SubscriptionDetails />
        <PlanCard />
        <UsageBars />
        <PaymentHistory />
      </div>
      {provider === 'razorpay' && razorpayConfig && (
        <Suspense fallback={null}>
          <RazorpayCheckoutModal config={razorpayConfig} onClose={clearRazorpayConfig} />
        </Suspense>
      )}
    </div>
  )
}
