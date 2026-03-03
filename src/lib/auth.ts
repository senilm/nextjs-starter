/**
 * @file auth.ts
 * @module lib/auth
 * Better Auth server configuration — auth, social login, 2FA, billing.
 */

import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { twoFactor, magicLink } from 'better-auth/plugins'
import { customSession } from 'better-auth/plugins'
import { nextCookies } from 'better-auth/next-js'
import { stripe } from '@better-auth/stripe'
import Stripe from 'stripe'
import { format } from 'date-fns'

import { prisma } from '@/lib/prisma'
import { APP_NAME, APP_URL, PLANS } from '@/lib/config'
import { paths } from '@/lib/paths'
import type { PlanKey } from '@/lib/config'
import { sendEmail } from '@/features/email/send'

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'ShipStation',
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      const { PasswordReset } = await import('../../emails/password-reset')
      await sendEmail({
        to: user.email,
        subject: `Reset your ${APP_NAME} password`,
        template: PasswordReset({ name: user.name, resetUrl: url }),
      })
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      enabled: !!process.env.GOOGLE_CLIENT_ID,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
      enabled: !!process.env.GITHUB_CLIENT_ID,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      const { VerifyEmail } = await import('../../emails/verify-email')
      await sendEmail({
        to: user.email,
        subject: `Verify your email for ${APP_NAME}`,
        template: VerifyEmail({ name: user.name, verifyUrl: url }),
      })
    },
    afterEmailVerification: async (user) => {
      const { Welcome } = await import('../../emails/welcome')
      await sendEmail({
        to: user.email,
        subject: `Welcome to ${APP_NAME}!`,
        template: Welcome({ name: user.name, dashboardUrl: `${APP_URL}${paths.dashboard.home()}` }),
      })
    },
  },

  user: {
    changeEmail: { enabled: true },
    additionalFields: {
      roleId: { type: 'string', required: false },
      stripeCustomerId: { type: 'string', required: false },
      isActive: { type: 'boolean', defaultValue: true },
      deletedAt: { type: 'date', required: false },
      twoFactorEnabled: { type: 'boolean', defaultValue: false },
    },
  },

  plugins: [
    nextCookies(),
    twoFactor({ issuer: process.env.NEXT_PUBLIC_APP_NAME ?? 'ShipStation' }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        const { MagicLink } = await import('../../emails/magic-link')
        await sendEmail({
          to: email,
          subject: `Sign in to ${APP_NAME}`,
          template: MagicLink({ loginUrl: url }),
        })
      },
    }),
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      createCustomerOnSignUp: true,
      subscription: {
        enabled: true,
        plans: [
          {
            name: 'free',
            limits: { projects: 3, storage: 1 },
          },
          {
            name: 'pro',
            priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
            annualDiscountPriceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
            limits: { projects: 25, storage: 10 },
            freeTrial: { days: 14 },
          },
          {
            name: 'business',
            priceId: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID!,
            annualDiscountPriceId: process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID,
            limits: { projects: 100, storage: 50 },
          },
        ],
        onSubscriptionComplete: async ({ subscription, plan }) => {
          const user = await prisma.user.findUnique({
            where: { id: subscription.referenceId },
          })
          if (!user) return
          const { PaymentConfirmation } = await import('../../emails/payment-confirmation')
          const planConfig = PLANS[plan.name as PlanKey]
          const price = planConfig?.monthlyPrice ?? 0
          const amount = `$${price.toFixed(2)}`
          const nextBillingDate = subscription.periodEnd
            ? format(new Date(subscription.periodEnd), 'MMMM d, yyyy')
            : 'N/A'
          await sendEmail({
            to: user.email,
            subject: `Payment confirmed — ${APP_NAME}`,
            template: PaymentConfirmation({
              name: user.name,
              planName: planConfig?.name ?? plan.name,
              amount,
              nextBillingDate,
            }),
          })
        },
        onSubscriptionCancel: async ({ subscription }) => {
          const user = await prisma.user.findUnique({
            where: { id: subscription.referenceId },
          })
          if (!user) return
          const { SubscriptionCanceled } = await import('../../emails/subscription-canceled')
          const accessUntil = subscription.periodEnd
            ? format(new Date(subscription.periodEnd), 'MMMM d, yyyy')
            : 'end of current period'
          await sendEmail({
            to: user.email,
            subject: `Subscription canceled — ${APP_NAME}`,
            template: SubscriptionCanceled({
              name: user.name,
              accessUntil,
              resubscribeUrl: `${APP_URL}${paths.dashboard.billing()}`,
            }),
          })
        },
      },
    }),
    customSession(async ({ user, session }) => {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          role: {
            include: {
              rolePermissions: {
                include: { permission: true },
              },
            },
          },
        },
      })

      const permissions =
        dbUser?.role?.rolePermissions.map((rp) => rp.permission.key) ?? []

      return {
        user: {
          ...user,
          role: dbUser?.role ? { id: dbUser.role.id, name: dbUser.role.name } : null,
          permissions,
        },
        session,
      }
    }),
  ],
})

export type AuthSession = typeof auth.$Infer.Session
