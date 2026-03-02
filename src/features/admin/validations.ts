/**
 * @file validations.ts
 * @module features/admin/validations
 * Zod schemas for admin operations — shared between client forms and server actions.
 */

import { z } from 'zod/v3'

export const inviteUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  roleId: z.string().min(1, 'Role is required'),
})

export type InviteUserInput = z.infer<typeof inviteUserSchema>

export const updatePlanSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be 50 characters or fewer'),
  description: z.string().max(200, 'Description must be 200 characters or fewer').optional(),
  features: z.array(z.string()),
  isActive: z.boolean(),
})

export type UpdatePlanInput = z.infer<typeof updatePlanSchema>

export const systemSettingsSchema = z.object({
  siteName: z.string().min(1, 'Site name is required').max(100, 'Site name must be 100 characters or fewer'),
  siteUrl: z.string().url('Must be a valid URL'),
  supportEmail: z.string().email('Must be a valid email'),
  announcementBar: z.string().max(500, 'Announcement must be 500 characters or fewer').optional(),
  maintenanceMode: z.boolean(),
})

export type SystemSettingsInput = z.infer<typeof systemSettingsSchema>
