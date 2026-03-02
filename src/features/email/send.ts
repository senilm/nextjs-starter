/**
 * @file send.ts
 * @module features/email/send
 * Central email sending helper — renders React Email JSX and sends via Resend.
 */

import type { ReactElement } from 'react'

import { render } from '@react-email/render'
import { Resend } from 'resend'

interface SendEmailOptions {
  to: string
  subject: string
  template: ReactElement
  replyTo?: string
}

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({ to, subject, template, replyTo }: SendEmailOptions): Promise<void> {
  const html = await render(template)
  const from = process.env.EMAIL_FROM ?? 'noreply@example.com'

  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
    ...(replyTo ? { replyTo } : {}),
  })

  if (error) {
    throw new Error(`Failed to send email to ${to}: ${error.message}`)
  }
}
