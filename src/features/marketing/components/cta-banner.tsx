/**
 * @file cta-banner.tsx
 * @module features/marketing/components/cta-banner
 * Gradient CTA banner with decorative overlays and call-to-action button.
 */

import Link from 'next/link'

import { APP_NAME } from '@/lib/config'
import { paths } from '@/lib/paths'
import { Button } from '@/components/ui/button'
import { AnimatedSection } from '@/features/marketing/components/animated-section'

export const CtaBanner = (): React.ReactNode => {
  return (
    <section className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 px-8 py-16 text-center text-primary-foreground sm:px-16">
            {/* Decorative radial overlays */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 20% 80%, oklch(1 0 0 / 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, oklch(1 0 0 / 0.06) 0%, transparent 50%)',
              }}
            />

            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to ship your SaaS?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
                Join thousands of developers who launched faster with {APP_NAME}.
                Start building today.
              </p>
              <div className="mt-8">
                <Button
                  size="lg"
                  className="bg-white text-primary shadow-lg hover:bg-white/90"
                  asChild
                >
                  <Link href={paths.auth.signUp()}>Get Started Free</Link>
                </Button>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
