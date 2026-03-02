/**
 * @file hero.tsx
 * @module features/marketing/components/hero
 * Homepage hero section with headline, subtitle, and two CTA buttons.
 */

import Link from 'next/link'

import { APP_NAME } from '@/lib/config'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AnimatedSection } from '@/features/marketing/components/animated-section'

export const Hero = (): React.ReactNode => {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <AnimatedSection>
          <Badge variant="secondary" className="mb-6">
            Launch faster with {APP_NAME}
          </Badge>
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Ship your SaaS{' '}
            <span className="text-primary">in days, not months</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            The production-ready Next.js starter kit with authentication, billing,
            admin dashboard, and everything you need to launch your SaaS product.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/sign-up">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
