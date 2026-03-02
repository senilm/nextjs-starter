/**
 * @file faq.tsx
 * @module features/marketing/components/faq
 * FAQ section shell that passes data to FaqAccordion.
 */

import { AnimatedSection } from '@/features/marketing/components/animated-section'
import { FaqAccordion } from '@/features/marketing/components/faq-accordion'

const FAQ_ITEMS = [
  {
    question: 'What is included in the starter kit?',
    answer:
      'Authentication (email, OAuth, magic links, 2FA), Stripe billing with subscriptions, admin dashboard, RBAC, email templates, blog with MDX, contact form, SEO, and a fully responsive marketing site.',
  },
  {
    question: 'Can I use this for multiple projects?',
    answer:
      'Yes! Depending on your license, you can use ShipStation for personal or commercial projects. Check the pricing page for license details.',
  },
  {
    question: 'What tech stack is used?',
    answer:
      'Next.js 16, React 19, TypeScript, Tailwind CSS 4, Shadcn UI, Prisma, Better Auth, Stripe, Resend, and TanStack Query.',
  },
  {
    question: 'Do I need a Stripe account to get started?',
    answer:
      'Not right away. The app works with a free plan by default. You only need Stripe when you want to enable paid subscriptions.',
  },
  {
    question: 'Is there support available?',
    answer:
      'Pro and Business plans include priority support. Free plan users have access to community support and documentation.',
  },
] as const

export const Faq = (): React.ReactNode => {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Got questions? We have answers.
          </p>
        </AnimatedSection>

        <div className="mt-12">
          <FaqAccordion items={FAQ_ITEMS as unknown as { question: string; answer: string }[]} />
        </div>
      </div>
    </section>
  )
}
