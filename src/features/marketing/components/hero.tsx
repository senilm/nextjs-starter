/**
 * @file hero.tsx
 * @module features/marketing/components/hero
 * Homepage hero section with gradient glow, dot grid background, and CTA buttons.
 */

import Link from 'next/link'

import { APP_NAME } from '@/lib/config'
import { paths } from '@/lib/paths'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AnimatedSection } from '@/features/marketing/components/animated-section'

export const Hero = (): React.ReactNode => {
  return (
    <section className="relative flex min-h-[calc(100svh-4rem)] items-center overflow-hidden">
      {/* Dot grid background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle, oklch(0.65 0.19 55 / 0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
        }}
      />

      {/* Radial glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[700px] rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <AnimatedSection>
          <Badge variant="accent" className="mb-6">
            Launch faster with {APP_NAME}
          </Badge>
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Ship your SaaS{' '}
            <span className="text-gradient-primary">in days, not months</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            The production-ready Next.js starter kit with authentication, billing,
            admin dashboard, and everything you need to launch your SaaS product.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="shadow-lg hover:shadow-xl" asChild>
              <Link href={paths.auth.signUp()}>Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href={paths.pricing()}>View Pricing</Link>
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
