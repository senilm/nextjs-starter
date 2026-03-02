/**
 * @file features-grid.tsx
 * @module features/marketing/components/features-grid
 * Six feature cards in a 3x2 grid with staggered animations.
 */

import {
  Shield,
  CreditCard,
  LayoutDashboard,
  Users,
  Paintbrush,
  Zap,
} from 'lucide-react'

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedSection } from '@/features/marketing/components/animated-section'

const FEATURES = [
  {
    icon: Shield,
    title: 'Authentication',
    description: 'Email/password, OAuth, magic links, and 2FA built in with Better Auth.',
  },
  {
    icon: CreditCard,
    title: 'Stripe Billing',
    description: 'Subscriptions, plan management, and a customer portal out of the box.',
  },
  {
    icon: LayoutDashboard,
    title: 'Admin Dashboard',
    description: 'User management, analytics, role-based access control, and system settings.',
  },
  {
    icon: Users,
    title: 'RBAC',
    description: 'Fine-grained roles and permissions with server-side enforcement.',
  },
  {
    icon: Paintbrush,
    title: 'Beautiful UI',
    description: 'Shadcn components with dark mode, animations, and responsive design.',
  },
  {
    icon: Zap,
    title: 'Production Ready',
    description: 'TypeScript strict mode, Zod validation, SEO, and email templates included.',
  },
] as const

export const FeaturesGrid = (): React.ReactNode => {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to launch
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Stop rebuilding the same features. Start with a complete foundation.
          </p>
        </AnimatedSection>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <AnimatedSection key={feature.title} delay={index * 0.1}>
              <Card className="h-full">
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="size-5" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
