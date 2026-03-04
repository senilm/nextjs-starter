/**
 * @file actions.ts
 * @module features/projects/actions
 * Server actions for project CRUD — session, validate, permission, limits, execute, revalidate.
 */

'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/rbac'
import { createProjectSchema, updateProjectSchema } from '@/features/projects/validations'
import type { ProjectFilters, ProjectsResponse, ActionResult, Project } from '@/features/projects/types'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10

export async function getProjects(filters: ProjectFilters = {}): Promise<ProjectsResponse> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')

  const page = filters.page ?? DEFAULT_PAGE
  const limit = filters.limit ?? DEFAULT_LIMIT
  const skip = (page - 1) * limit

  const where = {
    userId: session.user.id,
    deletedAt: null,
    ...(filters.status && filters.status !== 'all' ? { status: filters.status } : {}),
    ...(filters.search
      ? {
          OR: [
            { name: { contains: filters.search, mode: 'insensitive' as const } },
            { description: { contains: filters.search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.project.count({ where }),
  ])

  return {
    projects: projects as Project[],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

export async function createProject(input: unknown): Promise<ActionResult<Project>> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = createProjectSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' }

  const canCreate = await hasPermission(session.user.id, 'projects.create')
  if (!canCreate) return { success: false, error: 'Permission denied' }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    include: { plan: true },
  })
  const limits = (subscription?.plan.limits as Record<string, number>) ?? { projects: 3 }
  const planName = subscription?.plan.name ?? 'Free'
  const maxProjects = limits.projects ?? 3
  const currentCount = await prisma.project.count({
    where: { userId: session.user.id, deletedAt: null },
  })

  if (currentCount >= maxProjects) {
    return {
      success: false,
      error: `You've reached the ${maxProjects} project limit on the ${planName} plan. Upgrade to create more.`,
      code: 'PLAN_LIMIT_REACHED',
    }
  }

  const project = await prisma.project.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
    },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  revalidatePath('/dashboard/projects')
  revalidatePath('/dashboard')

  return { success: true, data: project as Project }
}

export async function updateProject(input: unknown): Promise<ActionResult<Project>> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = updateProjectSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' }

  const canEdit = await hasPermission(session.user.id, 'projects.edit')
  if (!canEdit) return { success: false, error: 'Permission denied' }

  const existing = await prisma.project.findFirst({
    where: { id: parsed.data.id, userId: session.user.id, deletedAt: null },
  })
  if (!existing) return { success: false, error: 'Project not found' }

  const project = await prisma.project.update({
    where: { id: parsed.data.id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      status: parsed.data.status,
    },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  revalidatePath('/dashboard/projects')
  revalidatePath('/dashboard')

  return { success: true, data: project as Project }
}

export async function deleteProject(projectId: string): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { success: false, error: 'Unauthorized' }

  const canDelete = await hasPermission(session.user.id, 'projects.delete')
  if (!canDelete) return { success: false, error: 'Permission denied' }

  const existing = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id, deletedAt: null },
  })
  if (!existing) return { success: false, error: 'Project not found' }

  await prisma.project.update({
    where: { id: projectId },
    data: { deletedAt: new Date() },
  })

  revalidatePath('/dashboard/projects')
  revalidatePath('/dashboard')

  return { success: true }
}
