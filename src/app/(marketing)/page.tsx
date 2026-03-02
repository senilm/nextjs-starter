/**
 * @file page.tsx
 * @module app/(marketing)/page
 * Homepage — renders all marketing sections with metadata and JSON-LD.
 */

import type { Metadata } from 'next'

import { APP_NAME, APP_URL } from '@/lib/config'
import { Hero } from '@/features/marketing/components/hero'
import { SocialProof } from '@/features/marketing/components/social-proof'
import { FeaturesGrid } from '@/features/marketing/components/features-grid'
import { HowItWorks } from '@/features/marketing/components/how-it-works'
import { PricingSection } from '@/features/marketing/components/pricing-section'
import { Testimonials } from '@/features/marketing/components/testimonials'
import { Faq } from '@/features/marketing/components/faq'
import { CtaBanner } from '@/features/marketing/components/cta-banner'

export const metadata: Metadata = {
  title: `${APP_NAME} — Ship Your SaaS in Days`,
  description:
    'The production-ready Next.js starter kit with authentication, billing, admin dashboard, and everything you need to launch your SaaS product.',
  openGraph: {
    title: `${APP_NAME} — Ship Your SaaS in Days`,
    description:
      'The production-ready Next.js starter kit with authentication, billing, admin dashboard, and everything you need to launch your SaaS product.',
    url: APP_URL,
    siteName: APP_NAME,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP_NAME} — Ship Your SaaS in Days`,
    description:
      'The production-ready Next.js starter kit with authentication, billing, admin dashboard, and everything you need to launch your SaaS product.',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: APP_NAME,
  url: APP_URL,
  description:
    'Production-ready Next.js SaaS starter kit with authentication, billing, and admin dashboard.',
}

export default function HomePage(): React.ReactNode {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <SocialProof />
      <FeaturesGrid />
      <HowItWorks />
      <PricingSection />
      <Testimonials />
      <Faq />
      <CtaBanner />
    </>
  )
}
