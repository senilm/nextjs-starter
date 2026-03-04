/**
 * @file auth.ts
 * @module lib/auth
 * Better Auth server configuration — auth, social login, 2FA.
 */

import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { twoFactor, magicLink } from 'better-auth/plugins'
import { customSession } from 'better-auth/plugins'
import { nextCookies } from 'better-auth/next-js'

import { prisma } from '@/lib/prisma'
import { APP_NAME, APP_URL } from '@/lib/config'
import { paths } from '@/lib/paths'
import { sendEmail } from '@/features/email/send'

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
      paymentCustomerId: { type: 'string', required: false },
      isActive: { type: 'boolean', defaultValue: true },
      deletedAt: { type: 'date', required: false },
      twoFactorEnabled: { type: 'boolean', defaultValue: false },
    },
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const freePlan = await prisma.plan.findFirst({ where: { key: 'free' } })
          if (freePlan) {
            await prisma.subscription.upsert({
              where: { userId: user.id },
              update: {},
              create: {
                userId: user.id,
                planId: freePlan.id,
                provider: null,
                status: 'active',
              },
            })
          }
        },
      },
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
