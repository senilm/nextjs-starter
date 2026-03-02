/**
 * @file send.ts
 * @module features/email/send
 * Central email sending helper — renders React Email JSX and sends via SMTP.
 */

import type { ReactElement } from 'react'

import { render } from '@react-email/render'
import { createTransport, type Transporter } from 'nodemailer'

import { env } from '@/lib/env'

interface SendEmailOptions {
  to: string
  subject: string
  template: ReactElement
  replyTo?: string
}

let transporter: Transporter | null = null

function getTransporter(): Transporter {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    throw new Error('SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in .env')
  }

  if (!transporter) {
    transporter = createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    })
  }

  return transporter
}

export async function sendEmail({ to, subject, template, replyTo }: SendEmailOptions): Promise<void> {
  const html = await render(template)
  const from = env.EMAIL_FROM ?? 'noreply@example.com'

  await getTransporter().sendMail({
    from,
    to,
    subject,
    html,
    ...(replyTo ? { replyTo } : {}),
  })
}
