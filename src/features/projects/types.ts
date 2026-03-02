/**
 * @file types.ts
 * @module features/projects/types
 * Types for the projects feature.
 */

export const PROJECT_STATUSES = ['active', 'paused', 'archived'] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export interface Project {
  id: string
  name: string
  description: string | null
  status: ProjectStatus
  createdAt: Date
  updatedAt: Date
}

export interface ProjectFilters {
  search?: string
  status?: ProjectStatus | 'all'
  page?: number
  limit?: number
}

export interface ProjectsResponse {
  projects: Project[]
  total: number
  page: number
  totalPages: number
}

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
  code?: string
}
