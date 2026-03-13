/**
 * @file actions.ts
 * @module features/billing/actions
 * Server actions for billing — subscription, checkout, cancel, resume, payment history.
 */

'use server'

import { revalidatePath } from 'next/cache'
import { after } from 'next/server'

import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { logAudit, getClientIp } from '@/lib/audit'
import { Module, AuditAction } from '@/lib/constants'
import { getPaymentProvider, getPaymentProviderName } from '@/lib/payment'
import { APP_URL } from '@/lib/config'
import { paths } from '@/lib/paths'
import type { ActionResult } from '@/types/shared'
import type {
  SubscriptionWithPlan,
  CheckoutInput,
  PaymentWithPlan,
} from '@/features/billing/types'
import type { CheckoutResult, PaymentProviderName } from '@/lib/payment/types'
import { Plan } from '@prisma/client'

export async function getSubscription(): Promise<SubscriptionWithPlan> {
  const { user: { id: userId } } = await requireAuth()

  return prisma.subscription.findUniqueOrThrow({
    where: { userId },
    include: { plan: true },
  })
}

export async function initiateCheckout(
  input: CheckoutInput,
): Promise<ActionResult<CheckoutResult>> {
  const session = await requireAuth()
  const { id: userId, email, name } = session.user

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
    customer: { email, name },
  })

  const ip = await getClientIp()
  after(async () => {
    await logAudit({
      module: Module.Billing,
      action: AuditAction.Checkout,
      recordId: plan.id,
      userId,
      userName: name,
      userEmail: email,
      userRole: session.user.role?.name,
      newValues: { plan: plan.name, interval: input.interval },
      ipAddress: ip,
    })
  })

  return { success: true, data: result }
}

export async function cancelSubscription(): Promise<ActionResult> {
  const session = await requireAuth()
  const userId = session.user.id

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: { plan: { select: { name: true } } },
  })
  if (!subscription?.providerSubscriptionId || !subscription.provider) {
    return { success: false, error: 'No active paid subscription' }
  }

  const provider = await getPaymentProvider()
  await provider.cancelSubscription(subscription.providerSubscriptionId)

  await prisma.subscription.update({
    where: { userId },
    data: { cancelAtPeriodEnd: true },
  })

  const ip = await getClientIp()
  after(async () => {
    await logAudit({
      module: Module.Billing,
      action: AuditAction.Canceled,
      recordId: subscription.id,
      userId,
      userName: session.user.name,
      userEmail: session.user.email,
      userRole: session.user.role?.name,
      newValues: { plan: subscription.plan.name },
      ipAddress: ip,
    })
  })

  revalidatePath(paths.dashboard.billing())
  return { success: true }
}

export async function resumeSubscription(): Promise<ActionResult> {
  const session = await requireAuth()
  const userId = session.user.id

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: { plan: { select: { name: true } } },
  })
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

  const ip = await getClientIp()
  after(async () => {
    await logAudit({
      module: Module.Billing,
      action: AuditAction.Resumed,
      recordId: subscription.id,
      userId,
      userName: session.user.name,
      userEmail: session.user.email,
      userRole: session.user.role?.name,
      newValues: { plan: subscription.plan.name },
      ipAddress: ip,
    })
  })

  revalidatePath(paths.dashboard.billing())
  return { success: true }
}

export async function getPaymentHistory(): Promise<PaymentWithPlan[]> {
  const { user: { id: userId } } = await requireAuth()

  return prisma.payment.findMany({
    where: { userId },
    include: { plan: { select: { name: true } } },
    orderBy: { paidAt: 'desc' },
    take: 50,
  })
}

export async function getActivePlans(): Promise<Plan[]> {
  return prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { monthlyPrice: 'asc' },
  })
}

function getPriceId(
  plan: {
    stripePriceId: string | null
    stripeYearlyPriceId: string | null
    razorpayPlanId: string | null
    razorpayYearlyPlanId: string | null
  },
  interval: 'monthly' | 'yearly',
  provider: PaymentProviderName,
): string | null {
  if (provider === 'stripe') {
    return interval === 'yearly' ? plan.stripeYearlyPriceId : plan.stripePriceId
  }
  return interval === 'yearly' ? plan.razorpayYearlyPlanId : plan.razorpayPlanId
}
