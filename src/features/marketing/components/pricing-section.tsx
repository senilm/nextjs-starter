/**
 * @file pricing-section.tsx
 * @module features/marketing/components/pricing-section
 * Pricing section shell for the homepage that wraps PricingToggle.
 */

import { AnimatedSection } from '@/features/marketing/components/animated-section'
import { PricingToggle } from '@/features/marketing/components/pricing-toggle'

export const PricingSection = (): React.ReactNode => {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Start free, upgrade when you need more. No hidden fees.
          </p>
        </AnimatedSection>

        <div className="mt-16">
          <PricingToggle />
        </div>
      </div>
    </section>
  )
}
