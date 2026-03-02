/**
 * @file types.ts
 * @module features/dashboard/types
 * Types for the dashboard home page data.
 */

export interface DashboardStats {
  totalProjects: number
  activeProjects: number
  storageUsed: number
  storageLimit: number
}

export interface RecentProject {
  id: string
  name: string
  status: string
  updatedAt: Date
}

export interface ActivityDataPoint {
  date: string
  projects: number
  views: number
}
