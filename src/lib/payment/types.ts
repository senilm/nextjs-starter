/**
 * @file types.ts
 * @module lib/payment/types
 * Provider-agnostic payment types and interface.
 */

export type PaymentProviderName = 'stripe' | 'razorpay'

export type BillingInterval = 'monthly' | 'yearly'

export type SubscriptionStatus = 'active' | 'trialing'

export type PaymentStatus = 'succeeded' | 'failed' | 'refunded'

export interface CreateCustomerParams {
  userId: string
  email: string
  name: string
}

export interface CreateCheckoutParams {
  customerId: string
  planId: string
  priceId: string
  interval: BillingInterval
  successUrl: string
  cancelUrl: string
  trialDays?: number
  metadata: { userId: string; planId: string }
}

export interface GetUpdatePaymentMethodUrlParams {
  customerId: string
  returnUrl: string
}

export interface RazorpayModalConfig {
  subscriptionId: string
  keyId: string
  name: string
  description: string
  prefill: { email: string; name: string }
  notes: Record<string, string>
}

export type CheckoutResult =
  | { type: 'redirect'; url: string }
  | { type: 'modal'; config: RazorpayModalConfig }

export type WebhookEvent =
  | 'subscription.active'
  | 'subscription.renewed'
  | 'subscription.canceled'
  | 'payment.failed'

export interface WebhookResult {
  event: WebhookEvent
  providerSubscriptionId: string
  providerCustomerId: string
  providerPaymentId?: string
  planId?: string
  userId?: string
  interval?: BillingInterval
  periodStart?: Date
  periodEnd?: Date
  amount?: number
  currency?: string
  invoiceUrl?: string | null
}

export interface PaymentProvider {
  readonly name: PaymentProviderName

  createCustomer(params: CreateCustomerParams): Promise<string>

  createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult>

  cancelSubscription(providerSubscriptionId: string): Promise<void>

  resumeSubscription(providerSubscriptionId: string): Promise<void>

  getUpdatePaymentMethodUrl(
    params: GetUpdatePaymentMethodUrlParams,
  ): Promise<string | null>

  handleWebhook(request: Request): Promise<WebhookResult>
}
