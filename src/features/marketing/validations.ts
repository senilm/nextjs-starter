/**
 * @file validations.ts
 * @module features/marketing/validations
 * Zod schemas for marketing forms.
 */

import { z } from 'zod/v3'

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be under 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be under 2000 characters'),
  honeypot: z.string().max(0, 'Bot detected'),
})

export type ContactFormValues = z.infer<typeof contactFormSchema>
