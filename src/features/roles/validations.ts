/**
 * @file validations.ts
 * @module features/roles/validations
 * Zod schemas for role CRUD — shared between client forms and server actions.
 */

import { z } from 'zod/v3'

import { nameSchema } from '@/lib/zod-presets'

export const createRoleSchema = z.object({
  name: nameSchema(),
  description: z.string().max(200, 'Description must be 200 characters or fewer').optional(),
  permissionKeys: z.array(z.string()).min(1, 'At least one permission is required'),
})

export type CreateRoleInput = z.infer<typeof createRoleSchema>

export const updateRoleSchema = z.object({
  id: z.string().min(1),
  name: nameSchema(),
  description: z.string().max(200, 'Description must be 200 characters or fewer').optional(),
  permissionKeys: z.array(z.string()).min(1, 'At least one permission is required'),
})

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>
