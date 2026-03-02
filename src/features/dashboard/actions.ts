/**
 * @file actions.ts
 * @module features/dashboard/actions
 * Server actions for the dashboard home page.
 */

'use server'

import { headers } from 'next/headers'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PLANS, type PlanKey } from '@/lib/config'
import type { DashboardStats, RecentProject } from '@/features/dashboard/types'

const RECENT_PROJECTS_LIMIT = 5

export async function getDashboardStats(): Promise<DashboardStats> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')

  const userId = session.user.id

  const [totalProjects, activeProjects, subscription] = await Promise.all([
    prisma.project.count({ where: { userId, deletedAt: null } }),
    prisma.project.count({ where: { userId, deletedAt: null, status: 'active' } }),
    prisma.subscription.findFirst({ where: { referenceId: userId } }),
  ])

  const planKey = (subscription?.plan ?? 'free') as PlanKey
  const plan = PLANS[planKey] ?? PLANS.free
  const storageLimit = plan.limits.storage

  return {
    totalProjects,
    activeProjects,
    storageUsed: 0,
    storageLimit,
  }
}

export async function getRecentProjects(): Promise<RecentProject[]> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id, deletedAt: null },
    orderBy: { updatedAt: 'desc' },
    take: RECENT_PROJECTS_LIMIT,
    select: { id: true, name: true, status: true, updatedAt: true },
  })

  return projects
}
