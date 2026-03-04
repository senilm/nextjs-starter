/**
 * @file stripe.ts
 * @module lib/payment/providers/stripe
 * Custom Stripe payment provider implementation.
 */

import Stripe from 'stripe'

import type {
  PaymentProvider,
  CreateCustomerParams,
  CreateCheckoutParams,
  GetUpdatePaymentMethodUrlParams,
  CheckoutResult,
  WebhookResult,
  BillingInterval,
} from '@/lib/payment/types'

function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured')
  return new Stripe(key)
}

export class StripeProvider implements PaymentProvider {
  readonly name = 'stripe' as const
  private readonly stripe: Stripe

  constructor() {
    this.stripe = getStripeClient()
  }

  async createCustomer(params: CreateCustomerParams): Promise<string> {
    const customer = await this.stripe.customers.create({
      email: params.email,
      name: params.name,
      metadata: { userId: params.userId },
    })
    return customer.id
  }

  async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult> {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: params.customerId,
      mode: 'subscription',
      line_items: [{ price: params.priceId, quantity: 1 }],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      subscription_data: {
        metadata: {
          userId: params.metadata.userId,
          planId: params.metadata.planId,
        },
      },
      metadata: {
        userId: params.metadata.userId,
        planId: params.metadata.planId,
      },
    }

    if (params.trialDays) {
      sessionParams.subscription_data!.trial_period_days = params.trialDays
    }

    const session = await this.stripe.checkout.sessions.create(sessionParams)

    return { type: 'redirect', url: session.url! }
  }

  async cancelSubscription(providerSubscriptionId: string): Promise<void> {
    await this.stripe.subscriptions.update(providerSubscriptionId, {
      cancel_at_period_end: true,
    })
  }

  async resumeSubscription(providerSubscriptionId: string): Promise<void> {
    await this.stripe.subscriptions.update(providerSubscriptionId, {
      cancel_at_period_end: false,
    })
  }

  async getUpdatePaymentMethodUrl(
    params: GetUpdatePaymentMethodUrlParams,
  ): Promise<string | null> {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: params.customerId,
      return_url: params.returnUrl,
    })
    return session.url
  }

  async handleWebhook(request: Request): Promise<WebhookResult> {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    if (!signature) throw new Error('Missing stripe-signature header')

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET is not configured')

    const event = this.stripe.webhooks.constructEvent(body, signature, webhookSecret)

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const status = sub.status

        if (status === 'active' || status === 'trialing') {
          const item = sub.items.data[0]
          const interval = getInterval(item)
          const { periodStart, periodEnd } = getSubscriptionPeriod(item)

          return {
            event: 'subscription.active',
            providerSubscriptionId: sub.id,
            providerCustomerId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
            planId: sub.metadata.planId,
            userId: sub.metadata.userId,
            interval,
            periodStart,
            periodEnd,
          }
        }

        if (status === 'canceled') {
          return {
            event: 'subscription.canceled',
            providerSubscriptionId: sub.id,
            providerCustomerId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
            userId: sub.metadata.userId,
          }
        }

        throw new Error(`Unhandled subscription status: ${status}`)
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        return {
          event: 'subscription.canceled',
          providerSubscriptionId: sub.id,
          providerCustomerId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
          userId: sub.metadata.userId,
        }
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const subId = getSubscriptionIdFromInvoice(invoice)
        if (!subId) throw new Error('Invoice has no subscription')

        const sub = await this.stripe.subscriptions.retrieve(subId)
        const item = sub.items.data[0]
        const interval = getInterval(item)
        const { periodStart, periodEnd } = getSubscriptionPeriod(item)

        return {
          event: 'subscription.renewed',
          providerSubscriptionId: subId,
          providerCustomerId: typeof invoice.customer === 'string'
            ? invoice.customer
            : (invoice.customer as Stripe.Customer)?.id ?? '',
          providerPaymentId: invoice.id,
          planId: sub.metadata.planId,
          userId: sub.metadata.userId,
          interval,
          periodStart,
          periodEnd,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          invoiceUrl: invoice.hosted_invoice_url ?? null,
        }
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subId = getSubscriptionIdFromInvoice(invoice)

        return {
          event: 'payment.failed',
          providerSubscriptionId: subId ?? '',
          providerCustomerId: typeof invoice.customer === 'string'
            ? invoice.customer
            : (invoice.customer as Stripe.Customer)?.id ?? '',
          providerPaymentId: invoice.id,
          amount: invoice.amount_due,
          currency: invoice.currency,
          invoiceUrl: invoice.hosted_invoice_url ?? null,
        }
      }

      default:
        throw new Error(`Unhandled Stripe event: ${event.type}`)
    }
  }
}

function getInterval(item: Stripe.SubscriptionItem | undefined): BillingInterval {
  return item?.price?.recurring?.interval === 'year' ? 'yearly' : 'monthly'
}

function getSubscriptionPeriod(item: Stripe.SubscriptionItem | undefined): {
  periodStart: Date | undefined
  periodEnd: Date | undefined
} {
  if (!item) return { periodStart: undefined, periodEnd: undefined }
  return {
    periodStart: item.current_period_start
      ? new Date(item.current_period_start * 1000)
      : undefined,
    periodEnd: item.current_period_end
      ? new Date(item.current_period_end * 1000)
      : undefined,
  }
}

function getSubscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const parent = invoice.parent
  if (parent?.type === 'subscription_details' && parent.subscription_details) {
    const sub = parent.subscription_details.subscription
    if (typeof sub === 'string') return sub
    if (sub && typeof sub === 'object' && 'id' in sub) return sub.id
  }
  return null
}
