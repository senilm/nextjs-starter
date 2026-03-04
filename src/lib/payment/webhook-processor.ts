/**
 * @file webhook-processor.ts
 * @module lib/payment/webhook-processor
 * Shared webhook result processing — updates subscription, inserts payment, sends email.
 */

import { format } from 'date-fns'

import { prisma } from '@/lib/prisma'
import { APP_NAME, APP_URL } from '@/lib/config'
import { paths } from '@/lib/paths'
import { sendEmail } from '@/features/email/send'
import { formatAmount } from '@/lib/payment/helpers'
import type { WebhookResult } from '@/lib/payment/types'

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
        await prisma.payment.create({
          data: {
            userId: user.id,
            subscriptionId: subscription.id,
            planId,
            provider: subscription.provider!,
            providerPaymentId: result.providerPaymentId,
            amount: result.amount,
            currency: result.currency ?? 'usd',
            status: 'succeeded',
            interval: result.interval ?? 'monthly',
            invoiceUrl: result.invoiceUrl,
            paidAt: new Date(),
          },
        })
      }

      const plan = await prisma.plan.findUnique({ where: { id: planId } })
      if (plan && result.amount != null) {
        const { PaymentConfirmation } = await import('../../../emails/payment-confirmation')
        const nextBillingDate = result.periodEnd
          ? format(result.periodEnd, 'MMMM d, yyyy')
          : 'N/A'
        await sendEmail({
          to: user.email,
          subject: `Payment confirmed — ${APP_NAME}`,
          template: PaymentConfirmation({
            name: user.name,
            planName: plan.name,
            amount: formatAmount(result.amount, result.currency ?? 'usd'),
            nextBillingDate,
          }),
        })
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
        await prisma.payment.create({
          data: {
            userId: user.id,
            subscriptionId: subscription.id,
            planId: subscription.planId,
            provider: subscription.provider!,
            providerPaymentId: result.providerPaymentId,
            amount: result.amount,
            currency: result.currency ?? 'usd',
            status: 'succeeded',
            interval: result.interval ?? subscription.interval ?? 'monthly',
            invoiceUrl: result.invoiceUrl,
            paidAt: new Date(),
          },
        })
      }

      const plan = await prisma.plan.findUnique({ where: { id: subscription.planId } })
      if (plan && result.amount != null) {
        const { PaymentConfirmation } = await import('../../../emails/payment-confirmation')
        const nextBillingDate = result.periodEnd
          ? format(result.periodEnd, 'MMMM d, yyyy')
          : 'N/A'
        await sendEmail({
          to: user.email,
          subject: `Payment confirmed — ${APP_NAME}`,
          template: PaymentConfirmation({
            name: user.name,
            planName: plan.name,
            amount: formatAmount(result.amount, result.currency ?? 'usd'),
            nextBillingDate,
          }),
        })
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
      break
    }

    case 'payment.failed': {
      const freePlan = await prisma.plan.findFirst({ where: { key: 'free' } })
      if (!freePlan) break

      if (result.providerPaymentId) {
        await prisma.payment.create({
          data: {
            userId: user.id,
            subscriptionId: subscription.id,
            planId: subscription.planId,
            provider: subscription.provider!,
            providerPaymentId: result.providerPaymentId,
            amount: result.amount ?? 0,
            currency: result.currency ?? 'usd',
            status: 'failed',
            interval: result.interval ?? subscription.interval ?? 'monthly',
            invoiceUrl: result.invoiceUrl,
            paidAt: new Date(),
          },
        })
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

      const { PaymentFailed } = await import('../../../emails/payment-failed')
      await sendEmail({
        to: user.email,
        subject: `Payment failed — ${APP_NAME}`,
        template: PaymentFailed({
          name: user.name,
          updatePaymentUrl: `${APP_URL}${paths.dashboard.billing()}`,
        }),
      })
      break
    }
  }
}
