/**
 * @file config.ts
 * @module lib/config
 * Application-wide configuration constants and plan definitions.
 */

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'ShipStation'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export const PLANS = {
  free: {
    name: 'Free',
    description: 'Perfect for trying things out',
    monthlyPrice: 0,
    yearlyPrice: 0,
    limits: { projects: 3, storage: 1 },
    features: ['3 projects', '1 GB storage', 'Community support', 'Basic analytics'],
  },
  pro: {
    name: 'Pro',
    description: 'For serious builders',
    monthlyPrice: 19,
    yearlyPrice: 190,
    badge: 'Popular',
    limits: { projects: 25, storage: 10 },
    features: [
      '25 projects',
      '10 GB storage',
      'Priority support',
      'Advanced analytics',
      'Custom domain',
      'API access',
    ],
  },
  business: {
    name: 'Business',
    description: 'For teams and agencies',
    monthlyPrice: 49,
    yearlyPrice: 490,
    limits: { projects: 100, storage: 50 },
    features: [
      '100 projects',
      '50 GB storage',
      'Dedicated support',
      'Full analytics suite',
      'Custom domain',
      'API access',
      'Team management',
      'White-label option',
    ],
  },
} as const

export type PlanKey = keyof typeof PLANS
