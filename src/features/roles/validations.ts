/**
 * @file validations.ts
 * @module features/roles/validations
 * Zod schemas for role CRUD — shared between client forms and server actions.
 */

import { z } from 'zod/v3'

export const createRoleSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be 50 characters or fewer'),
  description: z.string().max(200, 'Description must be 200 characters or fewer').optional(),
  permissionIds: z.array(z.string()).min(1, 'At least one permission is required'),
})

export type CreateRoleInput = z.infer<typeof createRoleSchema>

export const updateRoleSchema = z.object({
  id: z.string().min(1),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be 50 characters or fewer'),
  description: z.string().max(200, 'Description must be 200 characters or fewer').optional(),
  permissionIds: z.array(z.string()).min(1, 'At least one permission is required'),
})

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>
