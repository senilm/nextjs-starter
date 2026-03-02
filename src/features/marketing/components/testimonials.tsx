/**
 * @file testimonials.tsx
 * @module features/marketing/components/testimonials
 * Three testimonial cards with placeholder content.
 */

import { Card, CardContent } from '@/components/ui/card'
import { AnimatedSection } from '@/features/marketing/components/animated-section'

const TESTIMONIALS = [
  {
    quote: 'ShipStation saved us weeks of setup time. We launched our MVP in under a week.',
    name: 'Sarah Chen',
    role: 'CTO, LaunchPad',
  },
  {
    quote: 'The auth and billing integration alone is worth 10x the price. Everything just works.',
    name: 'Marcus Rivera',
    role: 'Founder, Buildfast',
  },
  {
    quote: 'Best starter kit I have used. Clean code, great patterns, and amazing documentation.',
    name: 'Aisha Patel',
    role: 'Senior Developer, NovaTech',
  },
] as const

export const Testimonials = (): React.ReactNode => {
  return (
    <section className="border-t bg-muted/30 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by developers
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Hear from teams who shipped faster with ShipStation.
          </p>
        </AnimatedSection>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <AnimatedSection key={testimonial.name} delay={index * 0.1}>
              <Card className="h-full">
                <CardContent className="pt-6">
                  <blockquote className="text-muted-foreground">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                  <div className="mt-4">
                    <p className="text-sm font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
