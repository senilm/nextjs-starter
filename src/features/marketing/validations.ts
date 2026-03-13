/**
 * @file validations.ts
 * @module features/marketing/validations
 * Zod schemas for marketing forms.
 */

import { z } from 'zod/v3'

import { emailSchema, nameSchema } from '@/lib/zod-presets'

export const contactFormSchema = z.object({
  name: nameSchema(100),
  email: emailSchema,
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be under 2000 characters'),
  honeypot: z.string().max(0, 'Bot detected'),
})

export type ContactFormValues = z.infer<typeof contactFormSchema>
