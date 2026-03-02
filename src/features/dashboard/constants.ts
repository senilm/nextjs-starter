/**
 * @file constants.ts
 * @module features/dashboard/constants
 * Mock data and chart configuration for the dashboard home page.
 */

import type { ChartConfig } from '@/components/ui/chart'
import type { ActivityDataPoint } from '@/features/dashboard/types'

export const STAT_TRENDS = {
  totalProjects: { value: 12, label: 'from last month' },
  activeProjects: { value: 8, label: 'from last month' },
  storageUsed: { value: -3, label: 'from last month' },
  planUsage: { value: 5, label: 'from last month' },
} as const

export const ACTIVITY_CHART_DATA: ActivityDataPoint[] = [
  { date: 'Feb 1', projects: 2, views: 120 },
  { date: 'Feb 2', projects: 1, views: 98 },
  { date: 'Feb 3', projects: 3, views: 145 },
  { date: 'Feb 4', projects: 0, views: 87 },
  { date: 'Feb 5', projects: 2, views: 160 },
  { date: 'Feb 6', projects: 1, views: 132 },
  { date: 'Feb 7', projects: 4, views: 178 },
  { date: 'Feb 8', projects: 2, views: 156 },
  { date: 'Feb 9', projects: 1, views: 110 },
  { date: 'Feb 10', projects: 3, views: 190 },
  { date: 'Feb 11', projects: 2, views: 142 },
  { date: 'Feb 12', projects: 0, views: 95 },
  { date: 'Feb 13', projects: 1, views: 128 },
  { date: 'Feb 14', projects: 3, views: 210 },
  { date: 'Feb 15', projects: 2, views: 175 },
  { date: 'Feb 16', projects: 1, views: 148 },
  { date: 'Feb 17', projects: 4, views: 220 },
  { date: 'Feb 18', projects: 2, views: 185 },
  { date: 'Feb 19', projects: 1, views: 155 },
  { date: 'Feb 20', projects: 3, views: 198 },
  { date: 'Feb 21', projects: 2, views: 168 },
  { date: 'Feb 22', projects: 0, views: 102 },
  { date: 'Feb 23', projects: 1, views: 135 },
  { date: 'Feb 24', projects: 3, views: 215 },
  { date: 'Feb 25', projects: 2, views: 182 },
  { date: 'Feb 26', projects: 1, views: 145 },
  { date: 'Feb 27', projects: 4, views: 238 },
  { date: 'Feb 28', projects: 2, views: 195 },
  { date: 'Mar 1', projects: 3, views: 225 },
  { date: 'Mar 2', projects: 2, views: 208 },
]

export const ACTIVITY_CHART_CONFIG = {
  projects: { label: 'Projects', color: 'hsl(var(--chart-1))' },
  views: { label: 'Page Views', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig
