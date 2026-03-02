/**
 * @file actions.ts
 * @module features/marketing/actions
 * Server actions for marketing features (contact form submission).
 */

'use server'

import { headers } from 'next/headers'

import { contactFormSchema, type ContactFormValues } from '@/features/marketing/validations'

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000
const MAX_REQUESTS_PER_WINDOW = 3

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return false
  }

  entry.count++
  return true
}

interface ActionResult {
  success: boolean
  error?: string
}

export const submitContactForm = async (
  values: ContactFormValues,
): Promise<ActionResult> => {
  const parsed = contactFormSchema.safeParse(values)
  if (!parsed.success) {
    return { success: false, error: 'Invalid form data' }
  }

  if (parsed.data.honeypot) {
    return { success: true }
  }

  const headersList = await headers()
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headersList.get('x-real-ip') ??
    'unknown'

  if (!checkRateLimit(ip)) {
    return {
      success: false,
      error: 'Too many requests. Please try again later.',
    }
  }

  try {
    const { sendEmail } = await import('@/features/email/send')
    const { ContactForm } = await import('../../../emails/contact-form')

    await sendEmail({
      to: process.env.EMAIL_FROM ?? 'admin@example.com',
      subject: `Contact form: ${parsed.data.name}`,
      template: ContactForm({
        senderName: parsed.data.name,
        senderEmail: parsed.data.email,
        message: parsed.data.message,
      }),
      replyTo: parsed.data.email,
    })

    return { success: true }
  } catch {
    return { success: false, error: 'Failed to send message. Please try again.' }
  }
}
