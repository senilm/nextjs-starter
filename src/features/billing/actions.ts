/**
 * @file actions.ts
 * @module features/billing/actions
 * Server actions for billing — subscription, checkout, cancel, resume, payment history.
 */

'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPaymentProvider, getPaymentProviderName } from '@/lib/payment'
import { APP_URL } from '@/lib/config'
import { paths } from '@/lib/paths'
import type { SubscriptionData, PaymentRecord, CheckoutInput, ActionResult } from '@/features/billing/types'
import type { CheckoutResult, PaymentProviderName } from '@/lib/payment/types'

async function requireAuth(): Promise<{ userId: string; email: string; name: string }> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  return { userId: session.user.id, email: session.user.email, name: session.user.name }
}

export async function getSubscription(): Promise<SubscriptionData> {
  const { userId } = await requireAuth()

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  })

  if (!subscription) {
    const freePlan = await prisma.plan.findFirst({ where: { key: 'free' } })
    return {
      planId: freePlan?.id ?? '',
      planKey: 'free',
      planName: 'Free',
      status: 'active',
      provider: null,
      interval: null,
      cancelAtPeriodEnd: false,
      periodStart: null,
      periodEnd: null,
      trialStart: null,
      trialEnd: null,
      limits: freePlan?.limits as Record<string, number> ?? { projects: 3, storage: 1 },
      features: freePlan?.features as string[] ?? [],
      monthlyPrice: freePlan?.monthlyPrice ?? 0,
      yearlyPrice: freePlan?.yearlyPrice ?? 0,
    }
  }

  return {
    planId: subscription.planId,
    planKey: subscription.plan.key,
    planName: subscription.plan.name,
    status: subscription.status,
    provider: subscription.provider,
    interval: subscription.interval,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    periodStart: subscription.periodStart,
    periodEnd: subscription.periodEnd,
    trialStart: subscription.trialStart,
    trialEnd: subscription.trialEnd,
    limits: subscription.plan.limits as Record<string, number>,
    features: subscription.plan.features as string[],
    monthlyPrice: subscription.plan.monthlyPrice,
    yearlyPrice: subscription.plan.yearlyPrice,
  }
}

export async function initiateCheckout(
  input: CheckoutInput,
): Promise<ActionResult<CheckoutResult>> {
  const { userId, email, name } = await requireAuth()

  const plan = await prisma.plan.findUnique({ where: { id: input.planId } })
  if (!plan || !plan.isActive) return { success: false, error: 'Plan not found or inactive' }

  const providerName = getPaymentProviderName()
  const priceId = getPriceId(plan, input.interval, providerName)
  if (!priceId) {
    return { success: false, error: `No ${providerName} price configured for this plan` }
  }

  const provider = await getPaymentProvider()

  let user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { success: false, error: 'User not found' }

  let customerId = user.paymentCustomerId
  if (!customerId) {
    customerId = await provider.createCustomer({ userId, email, name })
    await prisma.user.update({
      where: { id: userId },
      data: { paymentCustomerId: customerId },
    })
  }

  const subscription = await prisma.subscription.findUnique({ where: { userId } })
  if (subscription) {
    await prisma.subscription.update({
      where: { userId },
      data: {
        providerCustomerId: customerId,
        provider: providerName,
      },
    })
  }

  const result = await provider.createCheckout({
    customerId,
    planId: plan.id,
    priceId,
    interval: input.interval,
    successUrl: `${APP_URL}${paths.dashboard.billing()}?checkout=success`,
    cancelUrl: `${APP_URL}${paths.dashboard.billing()}?checkout=canceled`,
    trialDays: plan.trialDays ?? undefined,
    metadata: { userId, planId: plan.id },
  })

  return { success: true, data: result }
}

export async function cancelSubscription(): Promise<ActionResult> {
  const { userId } = await requireAuth()

  const subscription = await prisma.subscription.findUnique({ where: { userId } })
  if (!subscription?.providerSubscriptionId || !subscription.provider) {
    return { success: false, error: 'No active paid subscription' }
  }

  const provider = await getPaymentProvider()
  await provider.cancelSubscription(subscription.providerSubscriptionId)

  await prisma.subscription.update({
    where: { userId },
    data: { cancelAtPeriodEnd: true },
  })

  revalidatePath(paths.dashboard.billing())
  return { success: true }
}

export async function resumeSubscription(): Promise<ActionResult> {
  const { userId } = await requireAuth()

  const subscription = await prisma.subscription.findUnique({ where: { userId } })
  if (!subscription?.providerSubscriptionId || !subscription.provider) {
    return { success: false, error: 'No active paid subscription' }
  }

  if (!subscription.cancelAtPeriodEnd) {
    return { success: false, error: 'Subscription is not set to cancel' }
  }

  const provider = await getPaymentProvider()
  await provider.resumeSubscription(subscription.providerSubscriptionId)

  await prisma.subscription.update({
    where: { userId },
    data: { cancelAtPeriodEnd: false },
  })

  revalidatePath(paths.dashboard.billing())
  return { success: true }
}

export async function getUpdatePaymentMethodUrl(): Promise<ActionResult<string | null>> {
  const { userId } = await requireAuth()

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user?.paymentCustomerId) {
    return { success: true, data: null }
  }

  const provider = await getPaymentProvider()
  const url = await provider.getUpdatePaymentMethodUrl({
    customerId: user.paymentCustomerId,
    returnUrl: `${APP_URL}${paths.dashboard.billing()}`,
  })

  return { success: true, data: url }
}

export async function getPaymentHistory(): Promise<PaymentRecord[]> {
  const { userId } = await requireAuth()

  const payments = await prisma.payment.findMany({
    where: { userId },
    include: { plan: { select: { name: true } } },
    orderBy: { paidAt: 'desc' },
    take: 50,
  })

  return payments.map((p) => ({
    id: p.id,
    planName: p.plan.name,
    amount: p.amount,
    currency: p.currency,
    status: p.status,
    interval: p.interval,
    invoiceUrl: p.invoiceUrl,
    paidAt: p.paidAt,
    createdAt: p.createdAt,
  }))
}

export async function getActivePlans(): Promise<
  Array<{
    id: string
    key: string
    name: string
    description: string | null
    monthlyPrice: number | null
    yearlyPrice: number | null
    features: string[]
    isActive: boolean
  }>
> {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { monthlyPrice: 'asc' },
  })

  return plans.map((p) => ({
    id: p.id,
    key: p.key,
    name: p.name,
    description: p.description,
    monthlyPrice: p.monthlyPrice,
    yearlyPrice: p.yearlyPrice,
    features: p.features as string[],
    isActive: p.isActive,
  }))
}

export async function getActivePaymentProvider(): Promise<PaymentProviderName> {
  return getPaymentProviderName()
}

function getPriceId(
  plan: { stripePriceId: string | null; stripeYearlyPriceId: string | null; razorpayPlanId: string | null; razorpayYearlyPlanId: string | null },
  interval: 'monthly' | 'yearly',
  provider: PaymentProviderName,
): string | null {
  if (provider === 'stripe') {
    return interval === 'yearly' ? plan.stripeYearlyPriceId : plan.stripePriceId
  }
  return interval === 'yearly' ? plan.razorpayYearlyPlanId : plan.razorpayPlanId
}
