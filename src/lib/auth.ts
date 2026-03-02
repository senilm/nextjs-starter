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
import { prisma } from '@/lib/prisma'

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'ShipStation',
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
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
    sendVerificationEmail: async ({ user: _user, url: _url }) => {
      // Wired to Resend in Module 06
    },
  },

  user: {
    changeEmail: { enabled: true },
    additionalFields: {
      roleId: { type: 'string', required: false },
      isActive: { type: 'boolean', defaultValue: true },
      deletedAt: { type: 'date', required: false },
      twoFactorEnabled: { type: 'boolean', defaultValue: false },
    },
  },

  plugins: [
    nextCookies(),
    twoFactor({ issuer: process.env.NEXT_PUBLIC_APP_NAME ?? 'ShipStation' }),
    magicLink({
      sendMagicLink: async ({ email: _email, url: _url }) => {
        // Wired to Resend in Module 06
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
        onSubscriptionComplete: async () => {
          // TODO: Send payment confirmation email in Module 06
        },
        onSubscriptionCancel: async () => {
          // TODO: Send cancellation email in Module 06
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
