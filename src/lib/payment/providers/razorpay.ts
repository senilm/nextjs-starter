/**
 * @file razorpay.ts
 * @module lib/payment/providers/razorpay
 * Custom Razorpay payment provider implementation.
 */

import Razorpay from 'razorpay'
import crypto from 'crypto'

import type {
  PaymentProvider,
  CreateCustomerParams,
  CreateCheckoutParams,
  GetUpdatePaymentMethodUrlParams,
  CheckoutResult,
  WebhookResult,
} from '@/lib/payment/types'

function getRazorpayClient(): InstanceType<typeof Razorpay> {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) throw new Error('Razorpay credentials are not configured')
  return new Razorpay({ key_id: keyId, key_secret: keySecret })
}

export class RazorpayProvider implements PaymentProvider {
  readonly name = 'razorpay' as const
  private readonly razorpay: InstanceType<typeof Razorpay>

  constructor() {
    this.razorpay = getRazorpayClient()
  }

  async createCustomer(params: CreateCustomerParams): Promise<string> {
    const customer = await this.razorpay.customers.create({
      name: params.name,
      email: params.email,
      notes: { userId: params.userId },
    })
    return customer.id
  }

  async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult> {
    const subscription = await (this.razorpay.subscriptions.create as Function)({
      plan_id: params.priceId,
      customer_id: params.customerId,
      total_count: params.interval === 'yearly' ? 10 : 120,
      notes: {
        userId: params.metadata.userId,
        planId: params.metadata.planId,
      },
    }) as { id: string }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? process.env.RAZORPAY_KEY_ID ?? ''

    return {
      type: 'modal',
      config: {
        subscriptionId: subscription.id,
        keyId,
        name: process.env.NEXT_PUBLIC_APP_NAME ?? 'ShipStation',
        description: `Subscribe to plan`,
        prefill: { email: '', name: '' },
        notes: {
          userId: params.metadata.userId,
          planId: params.metadata.planId,
        },
      },
    }
  }

  async cancelSubscription(providerSubscriptionId: string): Promise<void> {
    await this.razorpay.subscriptions.cancel(providerSubscriptionId, false)
  }

  async resumeSubscription(providerSubscriptionId: string): Promise<void> {
    await (this.razorpay.subscriptions as unknown as {
      resume: (id: string, opts: Record<string, string>) => Promise<void>
    }).resume(providerSubscriptionId, { resume_at: 'now' })
  }

  async getUpdatePaymentMethodUrl(
    _params: GetUpdatePaymentMethodUrlParams,
  ): Promise<string | null> {
    return null
  }

  async handleWebhook(request: Request): Promise<WebhookResult> {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')
    if (!signature) throw new Error('Missing x-razorpay-signature header')

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!webhookSecret) throw new Error('RAZORPAY_WEBHOOK_SECRET is not configured')

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      throw new Error('Invalid Razorpay webhook signature')
    }

    const payload = JSON.parse(body) as RazorpayWebhookPayload

    switch (payload.event) {
      case 'subscription.activated':
      case 'subscription.charged': {
        const sub = payload.payload.subscription.entity
        const payment = payload.payload.payment?.entity

        return {
          event: payload.event === 'subscription.activated'
            ? 'subscription.active'
            : 'subscription.renewed',
          providerSubscriptionId: sub.id,
          providerCustomerId: sub.customer_id ?? '',
          providerPaymentId: payment?.id,
          planId: sub.notes?.planId,
          userId: sub.notes?.userId,
          interval: determineBillingInterval(sub),
          periodStart: sub.current_start
            ? new Date(sub.current_start * 1000)
            : undefined,
          periodEnd: sub.current_end
            ? new Date(sub.current_end * 1000)
            : undefined,
          amount: payment?.amount,
          currency: payment?.currency,
          invoiceUrl: null,
        }
      }

      case 'subscription.completed':
      case 'subscription.cancelled': {
        const sub = payload.payload.subscription.entity
        return {
          event: 'subscription.canceled',
          providerSubscriptionId: sub.id,
          providerCustomerId: sub.customer_id ?? '',
          userId: sub.notes?.userId,
        }
      }

      case 'payment.failed': {
        const payment = payload.payload.payment?.entity
        const sub = payload.payload.subscription?.entity

        return {
          event: 'payment.failed',
          providerSubscriptionId: sub?.id ?? '',
          providerCustomerId: sub?.customer_id ?? payment?.customer_id ?? '',
          providerPaymentId: payment?.id,
          amount: payment?.amount,
          currency: payment?.currency,
          invoiceUrl: null,
        }
      }

      default:
        throw new Error(`Unhandled Razorpay event: ${payload.event}`)
    }
  }
}

function determineBillingInterval(
  sub: RazorpaySubscriptionEntity,
): 'monthly' | 'yearly' {
  if (sub.current_start && sub.current_end) {
    const diffDays = (sub.current_end - sub.current_start) / (60 * 60 * 24)
    return diffDays > 60 ? 'yearly' : 'monthly'
  }
  return 'monthly'
}

interface RazorpayWebhookPayload {
  event: string
  payload: {
    subscription: { entity: RazorpaySubscriptionEntity }
    payment?: { entity: RazorpayPaymentEntity }
  }
}

interface RazorpaySubscriptionEntity {
  id: string
  customer_id?: string
  plan_id: string
  status: string
  current_start?: number
  current_end?: number
  notes?: Record<string, string>
}

interface RazorpayPaymentEntity {
  id: string
  amount?: number
  currency?: string
  customer_id?: string
  notes?: Record<string, string>
}
