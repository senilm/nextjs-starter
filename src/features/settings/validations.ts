/**
 * @file validations.ts
 * @module features/settings/validations
 * Zod schemas for account settings forms.
 */

import { z } from 'zod/v3'

import { passwordSchema, nameSchema } from '@/lib/zod-presets'

export const profileSchema = z.object({
  name: nameSchema(),
})

export type ProfileInput = z.infer<typeof profileSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

export const twoFactorPasswordSchema = z.object({
  password: z.string().min(1, 'Password is required'),
})

export type TwoFactorPasswordInput = z.infer<typeof twoFactorPasswordSchema>

export const twoFactorVerifySchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
})

export type TwoFactorVerifyInput = z.infer<typeof twoFactorVerifySchema>

export const deleteAccountSchema = z.object({
  confirmation: z.literal('DELETE', { message: 'Type DELETE to confirm' }),
  password: z.string().min(1, 'Password is required'),
})

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>
