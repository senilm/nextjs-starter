/**
 * @file page.tsx
 * @module app/(marketing)/contact/page
 * Contact page with form and company info.
 */

import type { Metadata } from 'next'
import { Mail, MapPin } from 'lucide-react'

import { APP_NAME } from '@/lib/config'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ContactForm } from '@/features/marketing/components/contact-form'
import { AnimatedSection } from '@/features/marketing/components/animated-section'

export const metadata: Metadata = {
  title: `Contact — ${APP_NAME}`,
  description: `Get in touch with the ${APP_NAME} team. We would love to hear from you.`,
}

export default function ContactPage(): React.ReactNode {
  return (
    <div className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Get in touch
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Have a question or want to work together? Drop us a message.
          </p>
        </AnimatedSection>

        <div className="mt-16 grid gap-12 lg:grid-cols-2">
          <AnimatedSection delay={0.1}>
            <Card>
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>
                  Fill out the form below and we will get back to you within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContactForm />
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold">Contact information</h2>
                <p className="mt-2 text-muted-foreground">
                  Prefer to reach out directly? Here are our details.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Mail className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">support@shipstation.dev</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <MapPin className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">Remote — Worldwide</p>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  )
}
