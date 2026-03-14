/**
 * @file testimonials.tsx
 * @module features/marketing/components/testimonials
 * Three testimonial cards with avatars, star ratings, and decorative accents.
 */

import { Star } from 'lucide-react'

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

const STAR_COUNT = 5

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
          {TESTIMONIALS.map((testimonial, index) => {
            const initials = testimonial.name
              .split(' ')
              .map((n) => n[0])
              .join('')

            return (
              <AnimatedSection key={testimonial.name} delay={index * 0.1}>
                <Card className="relative h-full border-t-2 border-primary/40">
                  <CardContent className="pt-6">
                    {/* Star rating */}
                    <div className="mb-3 flex gap-0.5">
                      {Array.from({ length: STAR_COUNT }).map((_, i) => (
                        <Star
                          key={i}
                          className="size-4 fill-primary text-primary"
                        />
                      ))}
                    </div>

                    {/* Decorative quote mark */}
                    <span className="pointer-events-none absolute top-4 left-4 font-serif text-6xl leading-none text-primary/10">
                      &ldquo;
                    </span>

                    <blockquote className="relative text-muted-foreground">
                      {testimonial.quote}
                    </blockquote>

                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )
          })}
        </div>
      </div>
    </section>
  )
}
