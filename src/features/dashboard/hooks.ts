/**
 * @file hooks.ts
 * @module features/dashboard/hooks
 * TanStack Query hooks for the dashboard home page.
 */

'use client'

import { useQuery } from '@tanstack/react-query'

import { getDashboardStats, getRecentProjects } from '@/features/dashboard/actions'
import type { DashboardStats, RecentProject } from '@/features/dashboard/types'

export function useDashboardStats(): ReturnType<typeof useQuery<DashboardStats>> {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => getDashboardStats(),
  })
}

export function useRecentProjects(): ReturnType<typeof useQuery<RecentProject[]>> {
  return useQuery({
    queryKey: ['dashboard', 'recent-projects'],
    queryFn: () => getRecentProjects(),
  })
}
