/**
 * @file webhook-processor.ts
 * @module lib/payment/webhook-processor
 * Shared webhook result processing — updates subscription, inserts payment, sends email.
 */

import { format } from 'date-fns'
import { after } from 'next/server'

import { prisma } from '@/lib/prisma'
import { APP_NAME, APP_URL } from '@/lib/config'
import { paths } from '@/lib/paths'
import { sendEmail } from '@/features/email/send'
import { formatPaymentAmount } from '@/lib/format'
import type { WebhookResult } from '@/lib/payment/types'

async function createPaymentRecord(
  userId: string,
  subscriptionId: string,
  planId: string,
  provider: string,
  result: WebhookResult,
  status: 'succeeded' | 'failed',
  interval: string,
): Promise<void> {
  await prisma.payment.create({
    data: {
      userId,
      subscriptionId,
      planId,
      provider,
      providerPaymentId: result.providerPaymentId!,
      amount: status === 'failed' ? (result.amount ?? 0) : result.amount!,
      currency: result.currency ?? 'usd',
      status,
      interval,
      invoiceUrl: result.invoiceUrl,
      paidAt: new Date(),
    },
  })
}

async function sendPaymentConfirmation(
  email: string,
  name: string,
  planName: string,
  amount: number,
  currency: string,
  periodEnd: Date | null | undefined,
): Promise<void> {
  const { PaymentConfirmation } = await import('../../../emails/payment-confirmation')
  const nextBillingDate = periodEnd ? format(periodEnd, 'MMMM d, yyyy') : 'N/A'
  await sendEmail({
    to: email,
    subject: `Payment confirmed — ${APP_NAME}`,
    template: PaymentConfirmation({
      name,
      planName,
      amount: formatPaymentAmount(amount, currency),
      nextBillingDate,
    }),
  })
}

export async function processWebhookResult(result: WebhookResult): Promise<void> {
  const subscription = await prisma.subscription.findFirst({
    where: { providerSubscriptionId: result.providerSubscriptionId },
    include: { user: true },
  })

  if (!subscription) return

  const user = subscription.user

  switch (result.event) {
    case 'subscription.active': {
      const planId = result.planId ?? subscription.planId

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          planId,
          status: 'active',
          interval: result.interval ?? subscription.interval,
          periodStart: result.periodStart,
          periodEnd: result.periodEnd,
          cancelAtPeriodEnd: false,
          trialStart: null,
          trialEnd: null,
        },
      })

      if (result.providerPaymentId && result.amount != null) {
        await createPaymentRecord(
          user.id, subscription.id, planId, subscription.provider!,
          result, 'succeeded', result.interval ?? 'monthly',
        )
      }

      const plan = await prisma.plan.findUnique({ where: { id: planId } })
      if (plan && result.amount != null) {
        after(() =>
          sendPaymentConfirmation(
            user.email, user.name, plan.name,
            result.amount!, result.currency ?? 'usd', result.periodEnd,
          ),
        )
      }
      break
    }

    case 'subscription.renewed': {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          periodStart: result.periodStart,
          periodEnd: result.periodEnd,
          status: 'active',
        },
      })

      if (result.providerPaymentId && result.amount != null) {
        await createPaymentRecord(
          user.id, subscription.id, subscription.planId, subscription.provider!,
          result, 'succeeded', result.interval ?? subscription.interval ?? 'monthly',
        )
      }

      const renewedPlan = await prisma.plan.findUnique({ where: { id: subscription.planId } })
      if (renewedPlan && result.amount != null) {
        after(() =>
          sendPaymentConfirmation(
            user.email, user.name, renewedPlan.name,
            result.amount!, result.currency ?? 'usd', result.periodEnd,
          ),
        )
      }
      break
    }

    case 'subscription.canceled': {
      const freePlan = await prisma.plan.findFirst({ where: { key: 'free' } })
      if (!freePlan) break

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          planId: freePlan.id,
          provider: null,
          providerCustomerId: null,
          providerSubscriptionId: null,
          status: 'active',
          interval: null,
          periodStart: null,
          periodEnd: null,
          cancelAtPeriodEnd: false,
          trialStart: null,
          trialEnd: null,
        },
      })

      after(async () => {
        const { SubscriptionCanceled } = await import('../../../emails/subscription-canceled')
        await sendEmail({
          to: user.email,
          subject: `Subscription canceled — ${APP_NAME}`,
          template: SubscriptionCanceled({
            name: user.name,
            accessUntil: 'now',
            resubscribeUrl: `${APP_URL}${paths.dashboard.billing()}`,
          }),
        })
      })
      break
    }

    case 'payment.failed': {
      const freePlan = await prisma.plan.findFirst({ where: { key: 'free' } })
      if (!freePlan) break

      if (result.providerPaymentId) {
        await createPaymentRecord(
          user.id, subscription.id, subscription.planId, subscription.provider!,
          result, 'failed', result.interval ?? subscription.interval ?? 'monthly',
        )
      }

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          planId: freePlan.id,
          provider: null,
          providerCustomerId: null,
          providerSubscriptionId: null,
          status: 'active',
          interval: null,
          periodStart: null,
          periodEnd: null,
          cancelAtPeriodEnd: false,
          trialStart: null,
          trialEnd: null,
        },
      })

      after(async () => {
        const { PaymentFailed } = await import('../../../emails/payment-failed')
        await sendEmail({
          to: user.email,
          subject: `Payment failed — ${APP_NAME}`,
          template: PaymentFailed({
            name: user.name,
            updatePaymentUrl: `${APP_URL}${paths.dashboard.billing()}`,
          }),
        })
      })
      break
    }
  }
}
