/**
 * @file validations.ts
 * @module features/auth/validations
 * Zod schemas for authentication forms — shared between client and server.
 */

import { z } from 'zod/v3'

import { emailSchema, passwordSchema, nameSchema } from '@/lib/zod-presets'

export const signUpSchema = z.object({
  name: nameSchema(),
  email: emailSchema,
  password: passwordSchema,
})

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const magicLinkSchema = z.object({
  email: emailSchema,
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type MagicLinkInput = z.infer<typeof magicLinkSchema>
