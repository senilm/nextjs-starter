/**
 * @file validations.ts
 * @module features/projects/validations
 * Zod schemas for project CRUD — shared between client forms and server actions.
 */

import { z } from 'zod/v3'

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be 100 characters or fewer'),
  description: z.string().max(500, 'Description must be 500 characters or fewer').optional(),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>

export const updateProjectSchema = z.object({
  id: z.string().min(1),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be 100 characters or fewer'),
  description: z.string().max(500, 'Description must be 500 characters or fewer').optional(),
  status: z.enum(['active', 'paused', 'archived']),
})

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
