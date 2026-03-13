/**
 * @file validations.ts
 * @module features/projects/validations
 * Zod schemas for project CRUD — shared between client forms and server actions.
 */

import { z } from 'zod/v3'

import { nameSchema } from '@/lib/zod-presets'

export const createProjectSchema = z.object({
  name: nameSchema(100),
  description: z.string().max(500, 'Description must be 500 characters or fewer').optional(),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>

export const updateProjectSchema = z.object({
  id: z.string().min(1),
  name: nameSchema(100),
  description: z.string().max(500, 'Description must be 500 characters or fewer').optional(),
  status: z.enum(['active', 'paused', 'archived']),
})

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
