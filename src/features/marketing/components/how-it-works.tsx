/**
 * @file how-it-works.tsx
 * @module features/marketing/components/how-it-works
 * Three-step section with numbered circles, connecting lines, and varied animations.
 */

import { GitBranch, Settings, Rocket } from 'lucide-react'

import { AnimatedSection } from '@/features/marketing/components/animated-section'

const STEPS = [
  {
    icon: GitBranch,
    step: '01',
    title: 'Clone',
    description: 'Clone the repository and install dependencies with a single command.',
    variant: 'slideLeft' as const,
  },
  {
    icon: Settings,
    step: '02',
    title: 'Customize',
    description: 'Configure your branding, plans, and features to match your product.',
    variant: 'scaleUp' as const,
  },
  {
    icon: Rocket,
    step: '03',
    title: 'Deploy',
    description: 'Deploy to Vercel or any Node.js host and start acquiring customers.',
    variant: 'slideRight' as const,
  },
] as const

export const HowItWorks = (): React.ReactNode => {
  return (
    <section className="border-t bg-muted/30 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Up and running in minutes
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Three simple steps from download to production.
          </p>
        </AnimatedSection>

        <div className="relative mt-16 grid gap-8 md:grid-cols-3">
          {/* Connecting line (desktop only) */}
          <div className="pointer-events-none absolute top-7 left-[16.67%] right-[16.67%] hidden border-t-2 border-dashed border-primary/20 md:block" />

          {STEPS.map((step, index) => (
            <AnimatedSection key={step.title} delay={index * 0.15} variant={step.variant} className="text-center">
              <div className="relative">
                <div className="relative z-10 mx-auto mb-4 flex size-14 items-center justify-center rounded-full border-2 border-primary bg-background text-primary font-mono text-lg font-bold">
                  {step.step}
                </div>
                <step.icon className="mx-auto mb-3 size-5 text-muted-foreground" />
              </div>
              <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-muted-foreground">{step.description}</p>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
