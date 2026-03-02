/**
 * @file validations.ts
 * @module features/settings/validations
 * Zod schemas for account settings forms.
 */

import { z } from 'zod/v3'

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be 50 characters or fewer'),
})

export type ProfileInput = z.infer<typeof profileSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

export const twoFactorVerifySchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
})

export type TwoFactorVerifyInput = z.infer<typeof twoFactorVerifySchema>

export const deleteAccountSchema = z.object({
  confirmation: z.literal('DELETE', { message: 'Type DELETE to confirm' }),
})

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>
