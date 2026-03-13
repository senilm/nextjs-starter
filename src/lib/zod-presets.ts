/**
 * @file zod-presets.ts
 * @module lib/zod-presets
 * Reusable Zod schema fragments — single source of truth for common field validations.
 */

import { z } from 'zod/v3'

export const emailSchema = z.string().email('Please enter a valid email address')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number')

export const nameSchema = (max = 50): z.ZodString =>
  z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(max, `Name must be ${max} characters or fewer`)
