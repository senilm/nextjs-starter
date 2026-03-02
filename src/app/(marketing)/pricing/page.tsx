/**
 * @file page.tsx
 * @module app/(marketing)/pricing/page
 * Full pricing page with toggle, plan cards, comparison table, and billing FAQ.
 */

import type { Metadata } from 'next'

import { APP_NAME } from '@/lib/config'
import { PricingToggle } from '@/features/marketing/components/pricing-toggle'
import { FeatureComparisonTable } from '@/features/marketing/components/feature-comparison-table'
import { FaqAccordion } from '@/features/marketing/components/faq-accordion'
import { AnimatedSection } from '@/features/marketing/components/animated-section'

export const metadata: Metadata = {
  title: `Pricing — ${APP_NAME}`,
  description: `Simple, transparent pricing for ${APP_NAME}. Start free, upgrade when you need more.`,
}

const BILLING_FAQ = [
  {
    question: 'Can I switch plans anytime?',
    answer:
      'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and billing is prorated.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express) through Stripe. We also support Apple Pay and Google Pay.',
  },
  {
    question: 'Is there a free trial?',
    answer:
      'The Free plan is always free. Paid plans come with a 14-day free trial so you can try all features before committing.',
  },
  {
    question: 'What happens when I cancel?',
    answer:
      'You keep access until the end of your billing period. After that, your account reverts to the Free plan. Your data is retained for 30 days.',
  },
]

export default function PricingPage(): React.ReactNode {
  return (
    <div className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Start free, upgrade when you need more. No hidden fees, no surprises.
          </p>
        </AnimatedSection>

        <div className="mt-16">
          <PricingToggle />
        </div>

        <AnimatedSection className="mt-24">
          <h2 className="mb-8 text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Compare plans
          </h2>
          <FeatureComparisonTable />
        </AnimatedSection>

        <AnimatedSection className="mx-auto mt-24 max-w-3xl">
          <h2 className="mb-8 text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Billing FAQ
          </h2>
          <FaqAccordion items={BILLING_FAQ} />
        </AnimatedSection>
      </div>
    </div>
  )
}
