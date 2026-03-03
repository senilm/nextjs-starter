/**
 * @file cta-banner.tsx
 * @module features/marketing/components/cta-banner
 * Gradient CTA banner with call-to-action button.
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
          <div className="rounded-2xl bg-primary px-8 py-16 text-center text-primary-foreground sm:px-16">
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
                variant="secondary"
                asChild
              >
                <Link href={paths.auth.signUp()}>Get Started Free</Link>
              </Button>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
