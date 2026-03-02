/**
 * @file env.ts
 * @module lib/env
 * Validates all required environment variables at app startup using Zod.
 */

import { z } from 'zod/v4'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  BETTER_AUTH_SECRET: z.string().min(
    32,
    'BETTER_AUTH_SECRET must be at least 32 characters. Generate with: openssl rand -base64 32',
  ),
  BETTER_AUTH_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'STRIPE_SECRET_KEY must start with sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith(
    'whsec_',
    'STRIPE_WEBHOOK_SECRET must start with whsec_',
  ),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith(
    'pk_',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with pk_',
  ),
  RESEND_API_KEY: z.string().startsWith('re_', 'RESEND_API_KEY must start with re_'),
  EMAIL_FROM: z.string().min(1, 'EMAIL_FROM is required'),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().min(1, 'NEXT_PUBLIC_APP_NAME is required'),

  /* OAuth — optional (app works without social login) */
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  /* Stripe price IDs — optional for dev (required for billing to work) */
  STRIPE_PRO_MONTHLY_PRICE_ID: z.string().optional(),
  STRIPE_PRO_YEARLY_PRICE_ID: z.string().optional(),
  STRIPE_BUSINESS_MONTHLY_PRICE_ID: z.string().optional(),
  STRIPE_BUSINESS_YEARLY_PRICE_ID: z.string().optional(),

  /* AWS S3 — optional (required for file uploads) */
  AWS_S3_BUCKET: z.string().optional(),
  AWS_S3_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

export const env: Env = envSchema.parse(process.env)
