/**
 * @file actions.ts
 * @module features/admin/actions
 * Server actions for the admin panel — stats, charts, user management, plans, settings.
 */

'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { subDays, subMonths, startOfDay, startOfMonth, format } from 'date-fns'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/rbac'
import { invalidateUserSessions } from '@/lib/rbac'
import { inviteUserSchema, updatePlanSchema, systemSettingsSchema } from '@/features/admin/validations'
import type {
  AdminStats,
  RevenueChartData,
  SubscriptionChartData,
  SignupChartData,
  UserFilters,
  UsersResponse,
  UserDetail,
  PlanWithStats,
  ActionResult,
} from '@/features/admin/types'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10
const CHART_PLAN_COLORS: Record<string, string> = {
  free: 'hsl(var(--chart-1))',
  pro: 'hsl(var(--chart-2))',
  business: 'hsl(var(--chart-3))',
}
const MONTHS_IN_CHART = 12
const DAYS_IN_SIGNUPS_CHART = 7

async function requireAdmin(permissionKey: string): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  const allowed = await hasPermission(session.user.id, permissionKey)
  if (!allowed) throw new Error('Permission denied')
  return session.user.id
}

export async function getAdminStats(): Promise<AdminStats> {
  await requireAdmin('admin.access')

  const now = new Date()
  const sevenDaysAgo = subDays(now, DAYS_IN_SIGNUPS_CHART)
  const fourteenDaysAgo = subDays(now, DAYS_IN_SIGNUPS_CHART * 2)

  const [
    totalUsers,
    activeSubscriptions,
    subscriptionsWithPlan,
    newSignups7d,
    prevSignups7d,
    prevActiveSubscriptions,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.subscription.count({ where: { status: 'active' } }),
    prisma.subscription.findMany({
      where: { status: 'active' },
      select: { plan: true },
    }),
    prisma.user.count({ where: { deletedAt: null, createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({
      where: { deletedAt: null, createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } },
    }),
    prisma.subscription.count({
      where: { status: 'active', periodStart: { lt: subMonths(now, 1) } },
    }),
  ])

  const PLAN_PRICES: Record<string, number> = { free: 0, pro: 19, business: 49 }
  const mrr = subscriptionsWithPlan.reduce((sum, sub) => sum + (PLAN_PRICES[sub.plan] ?? 0), 0)

  const usersTrend = totalUsers > 0 ? Math.round((newSignups7d / totalUsers) * 100) : 0
  const subscriptionsTrend =
    prevActiveSubscriptions > 0
      ? Math.round(((activeSubscriptions - prevActiveSubscriptions) / prevActiveSubscriptions) * 100)
      : 0
  const signupsTrend =
    prevSignups7d > 0 ? Math.round(((newSignups7d - prevSignups7d) / prevSignups7d) * 100) : 0

  return {
    totalUsers,
    activeSubscriptions,
    mrr,
    newSignups7d,
    usersTrend,
    subscriptionsTrend,
    mrrTrend: subscriptionsTrend,
    signupsTrend,
  }
}

export async function getRevenueChartData(): Promise<RevenueChartData[]> {
  await requireAdmin('admin.access')

  const now = new Date()
  const data: RevenueChartData[] = []

  for (let i = MONTHS_IN_CHART - 1; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(now, i))
    const monthEnd = startOfMonth(subMonths(now, i - 1))

    const subs = await prisma.subscription.findMany({
      where: {
        status: 'active',
        periodStart: { lte: monthEnd },
        OR: [{ periodEnd: null }, { periodEnd: { gte: monthStart } }],
      },
      select: { plan: true },
    })

    const PLAN_PRICES: Record<string, number> = { free: 0, pro: 19, business: 49 }
    const revenue = subs.reduce((sum, sub) => sum + (PLAN_PRICES[sub.plan] ?? 0), 0)

    data.push({ month: format(monthStart, 'MMM'), revenue })
  }

  return data
}

export async function getSubscriptionChartData(): Promise<SubscriptionChartData[]> {
  await requireAdmin('admin.access')

  const subs = await prisma.subscription.groupBy({
    by: ['plan'],
    where: { status: 'active' },
    _count: { plan: true },
  })

  const freeUsers = await prisma.user.count({
    where: {
      deletedAt: null,
      subscriptions: { none: { status: 'active' } },
    },
  })

  const result: SubscriptionChartData[] = [
    { plan: 'free', count: freeUsers, fill: CHART_PLAN_COLORS.free ?? 'hsl(var(--chart-1))' },
  ]

  for (const sub of subs) {
    result.push({
      plan: sub.plan,
      count: sub._count.plan,
      fill: CHART_PLAN_COLORS[sub.plan] ?? 'hsl(var(--chart-4))',
    })
  }

  return result
}

export async function getSignupChartData(): Promise<SignupChartData[]> {
  await requireAdmin('admin.access')

  const now = new Date()
  const data: SignupChartData[] = []

  for (let i = DAYS_IN_SIGNUPS_CHART - 1; i >= 0; i--) {
    const dayStart = startOfDay(subDays(now, i))
    const dayEnd = startOfDay(subDays(now, i - 1))

    const count = await prisma.user.count({
      where: { deletedAt: null, createdAt: { gte: dayStart, lt: dayEnd } },
    })

    data.push({ day: format(dayStart, 'EEE'), signups: count })
  }

  return data
}

export async function getUsers(filters: UserFilters = {}): Promise<UsersResponse> {
  await requireAdmin('users.view')

  const page = filters.page ?? DEFAULT_PAGE
  const limit = filters.limit ?? DEFAULT_LIMIT
  const skip = (page - 1) * limit

  const where = {
    deletedAt: null,
    ...(filters.search
      ? {
          OR: [
            { name: { contains: filters.search, mode: 'insensitive' as const } },
            { email: { contains: filters.search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
    ...(filters.roleId && filters.roleId !== 'all' ? { roleId: filters.roleId } : {}),
    ...(filters.status === 'active' ? { isActive: true } : {}),
    ...(filters.status === 'suspended' ? { isActive: false } : {}),
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        role: { select: { id: true, name: true } },
        subscriptions: { where: { status: 'active' }, select: { plan: true, status: true }, take: 1 },
      },
    }),
    prisma.user.count({ where }),
  ])

  return {
    users: users.map((u) => ({
      ...u,
      subscription: u.subscriptions[0] ?? null,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getUserDetail(userId: string): Promise<UserDetail | null> {
  await requireAdmin('users.view')

  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    include: {
      role: {
        include: { rolePermissions: { include: { permission: { select: { key: true } } } } },
      },
      subscriptions: { where: { status: 'active' }, select: { plan: true, status: true }, take: 1 },
      sessions: {
        select: { id: true, ipAddress: true, userAgent: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })

  if (!user) return null

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    isActive: user.isActive,
    emailVerified: user.emailVerified,
    twoFactorEnabled: user.twoFactorEnabled,
    role: user.role ? { id: user.role.id, name: user.role.name } : null,
    subscription: user.subscriptions[0] ?? null,
    sessions: user.sessions,
    permissions: user.role?.rolePermissions.map((rp) => rp.permission.key) ?? [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

export async function changeUserRole(userId: string, roleId: string): Promise<ActionResult> {
  const adminId = await requireAdmin('users.edit')
  if (userId === adminId) return { success: false, error: 'Cannot change your own role' }

  const role = await prisma.role.findFirst({ where: { id: roleId, deletedAt: null } })
  if (!role) return { success: false, error: 'Role not found' }

  await prisma.user.update({ where: { id: userId }, data: { roleId } })
  await invalidateUserSessions(userId)

  revalidatePath('/admin/users')
  return { success: true }
}

export async function suspendUser(userId: string): Promise<ActionResult> {
  const adminId = await requireAdmin('users.edit')
  if (userId === adminId) return { success: false, error: 'Cannot suspend yourself' }

  await prisma.user.update({ where: { id: userId }, data: { isActive: false } })
  await invalidateUserSessions(userId)

  revalidatePath('/admin/users')
  return { success: true }
}

export async function unsuspendUser(userId: string): Promise<ActionResult> {
  await requireAdmin('users.edit')

  await prisma.user.update({ where: { id: userId }, data: { isActive: true } })

  revalidatePath('/admin/users')
  return { success: true }
}

export async function deleteUser(userId: string): Promise<ActionResult> {
  const adminId = await requireAdmin('users.delete')
  if (userId === adminId) return { success: false, error: 'Cannot delete yourself' }

  await prisma.user.update({ where: { id: userId }, data: { deletedAt: new Date() } })
  await invalidateUserSessions(userId)

  revalidatePath('/admin/users')
  return { success: true }
}

export async function inviteUser(input: unknown): Promise<ActionResult> {
  await requireAdmin('users.create')

  const parsed = inviteUserSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' }

  const existing = await prisma.user.findFirst({
    where: { email: parsed.data.email, deletedAt: null },
  })
  if (existing) return { success: false, error: 'User with this email already exists' }

  const { nanoid } = await import('nanoid')
  const INVITATION_EXPIRY_DAYS = 7

  await prisma.userInvitation.create({
    data: {
      email: parsed.data.email,
      roleId: parsed.data.roleId,
      invitedBy: (await auth.api.getSession({ headers: await headers() }))!.user.id,
      token: nanoid(),
      expiresAt: new Date(Date.now() + INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    },
  })

  revalidatePath('/admin/users')
  return { success: true }
}

export async function getPlans(): Promise<PlanWithStats[]> {
  await requireAdmin('plans.view')

  const plans = await prisma.plan.findMany({ orderBy: { createdAt: 'asc' } })

  const plansWithStats: PlanWithStats[] = await Promise.all(
    plans.map(async (plan) => {
      const subscriberCount = await prisma.subscription.count({
        where: { plan: plan.key, status: 'active' },
      })
      return {
        id: plan.id,
        key: plan.key,
        name: plan.name,
        description: plan.description,
        monthlyPrice: plan.monthlyPrice,
        yearlyPrice: plan.yearlyPrice,
        trialDays: plan.trialDays,
        limits: plan.limits as Record<string, number>,
        features: plan.features as string[],
        isActive: plan.isActive,
        subscriberCount,
      }
    }),
  )

  return plansWithStats
}

export async function updatePlan(input: unknown): Promise<ActionResult> {
  await requireAdmin('plans.edit')

  const parsed = updatePlanSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' }

  await prisma.plan.update({
    where: { id: parsed.data.id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      features: parsed.data.features,
      isActive: parsed.data.isActive,
    },
  })

  revalidatePath('/admin/plans')
  return { success: true }
}

export async function getSystemSettings(): Promise<{
  id: string
  siteName: string
  siteUrl: string
  supportEmail: string
  announcementBar: string | null
  maintenanceMode: boolean
}> {
  await requireAdmin('settings.view')

  const settings = await prisma.systemSettings.findFirst()
  if (!settings) {
    const created = await prisma.systemSettings.create({ data: {} })
    return created
  }
  return settings
}

export async function updateSystemSettings(input: unknown): Promise<ActionResult> {
  await requireAdmin('settings.edit')

  const parsed = systemSettingsSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' }

  const settings = await prisma.systemSettings.findFirst()
  if (!settings) {
    await prisma.systemSettings.create({
      data: {
        siteName: parsed.data.siteName,
        siteUrl: parsed.data.siteUrl,
        supportEmail: parsed.data.supportEmail,
        announcementBar: parsed.data.announcementBar ?? null,
        maintenanceMode: parsed.data.maintenanceMode,
      },
    })
  } else {
    await prisma.systemSettings.update({
      where: { id: settings.id },
      data: {
        siteName: parsed.data.siteName,
        siteUrl: parsed.data.siteUrl,
        supportEmail: parsed.data.supportEmail,
        announcementBar: parsed.data.announcementBar ?? null,
        maintenanceMode: parsed.data.maintenanceMode,
      },
    })
  }

  revalidatePath('/admin/settings')
  return { success: true }
}
