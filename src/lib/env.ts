/**
 * @file env.ts
 * @module lib/env
 * Validates all required environment variables at app startup using Zod.
 */

import { z } from 'zod/v4'

const paymentProviderSchema = z.enum(['stripe', 'razorpay']).optional().default('stripe')

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  BETTER_AUTH_SECRET: z.string().min(
    32,
    'BETTER_AUTH_SECRET must be at least 32 characters. Generate with: openssl rand -base64 32',
  ),
  BETTER_AUTH_URL: z.string().url(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().min(1, 'NEXT_PUBLIC_APP_NAME is required'),

  /* OAuth — optional (app works without social login) */
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  /* Payment provider — one-time choice (set before launch) */
  PAYMENT_PROVIDER: paymentProviderSchema,

  /* Stripe — required when PAYMENT_PROVIDER=stripe */
  STRIPE_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  /* Razorpay — required when PAYMENT_PROVIDER=razorpay */
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  /* AWS S3 — optional (required for file uploads) */
  AWS_S3_BUCKET: z.string().optional(),
  AWS_S3_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

export const env: Env = envSchema.parse(process.env)
