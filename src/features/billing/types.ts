/**
 * @file types.ts
 * @module features/billing/types
 * Billing-specific types for subscription and payment data.
 */

export interface SubscriptionData {
  planId: string
  planKey: string
  planName: string
  status: string
  provider: string | null
  interval: string | null
  cancelAtPeriodEnd: boolean
  periodStart: Date | null
  periodEnd: Date | null
  trialStart: Date | null
  trialEnd: Date | null
  limits: Record<string, number>
  features: string[]
  monthlyPrice: number | null
  yearlyPrice: number | null
}

export interface PaymentRecord {
  id: string
  planName: string
  amount: number
  currency: string
  status: string
  interval: string
  invoiceUrl: string | null
  paidAt: Date
  createdAt: Date
}

export interface CheckoutInput {
  planId: string
  interval: 'monthly' | 'yearly'
}

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}
