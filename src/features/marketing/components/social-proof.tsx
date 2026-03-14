/**
 * @file social-proof.tsx
 * @module features/marketing/components/social-proof
 * Trusted-by stats row with left-aligned accent borders and subtle gradient background.
 */

import { AnimatedSection } from '@/features/marketing/components/animated-section'

const STATS = [
  { value: '2,500+', label: 'Developers' },
  { value: '500+', label: 'Projects Shipped' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.9/5', label: 'Satisfaction' },
] as const

export const SocialProof = (): React.ReactNode => {
  return (
    <section className="border-y bg-gradient-to-r from-primary/[0.03] via-transparent to-primary/[0.03] py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="border-l-2 border-primary/30 pl-4">
                <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
