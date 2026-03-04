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
import { APP_URL } from '@/lib/config'
import { paths } from '@/lib/paths'
import { sendEmail } from '@/features/email/send'
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
  const oneMonthAgo = subMonths(now, 1)

  const [
    totalUsers,
    activeSubscriptions,
    newSignups7d,
    prevSignups7d,
    prevActiveSubscriptions,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.subscription.count({
      where: { status: 'active', plan: { key: { not: 'free' } } },
    }),
    prisma.user.count({ where: { deletedAt: null, createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({
      where: { deletedAt: null, createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } },
    }),
    prisma.subscription.count({
      where: { status: 'active', plan: { key: { not: 'free' } }, periodStart: { lt: oneMonthAgo } },
    }),
  ])

  const payments = await prisma.payment.aggregate({
    where: {
      status: 'succeeded',
      paidAt: { gte: subMonths(now, 1) },
    },
    _sum: { amount: true },
  })
  const mrr = Math.round((payments._sum.amount ?? 0) / 100)

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

    const payments = await prisma.payment.aggregate({
      where: {
        status: 'succeeded',
        paidAt: { gte: monthStart, lt: monthEnd },
      },
      _sum: { amount: true },
    })

    const revenue = Math.round((payments._sum.amount ?? 0) / 100)
    data.push({ month: format(monthStart, 'MMM'), revenue })
  }

  return data
}

export async function getSubscriptionChartData(): Promise<SubscriptionChartData[]> {
  await requireAdmin('admin.access')

  const subscriptions = await prisma.subscription.findMany({
    where: { status: 'active' },
    include: { plan: { select: { key: true } } },
  })

  const counts: Record<string, number> = {}
  for (const sub of subscriptions) {
    const planKey = sub.plan.key
    counts[planKey] = (counts[planKey] ?? 0) + 1
  }

  return Object.entries(counts).map(([plan, count]) => ({
    plan,
    count,
    fill: CHART_PLAN_COLORS[plan] ?? 'hsl(var(--chart-4))',
  }))
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
        subscription: {
          select: { status: true, plan: { select: { key: true, name: true } } },
        },
      },
    }),
    prisma.user.count({ where }),
  ])

  return {
    users: users.map((u) => ({
      ...u,
      subscription: u.subscription
        ? { plan: u.subscription.plan.key, status: u.subscription.status }
        : null,
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
      subscription: {
        include: { plan: { select: { key: true, name: true } } },
      },
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
    subscription: user.subscription
      ? { plan: user.subscription.plan.key, status: user.subscription.status }
      : null,
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

  const session = (await auth.api.getSession({ headers: await headers() }))!
  const token = nanoid()

  await prisma.userInvitation.create({
    data: {
      email: parsed.data.email,
      roleId: parsed.data.roleId,
      invitedBy: session.user.id,
      token,
      expiresAt: new Date(Date.now() + INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    },
  })

  const role = await prisma.role.findFirst({ where: { id: parsed.data.roleId, deletedAt: null } })
  const { UserInvitation } = await import('../../../emails/user-invitation')
  await sendEmail({
    to: parsed.data.email,
    subject: `You've been invited to join ${process.env.NEXT_PUBLIC_APP_NAME ?? 'ShipStation'}`,
    template: UserInvitation({
      inviterName: session.user.name,
      roleName: role?.name ?? 'Member',
      signUpUrl: `${APP_URL}${paths.auth.signUp(token)}`,
    }),
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
        where: { planId: plan.id, status: 'active' },
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
        stripePriceId: plan.stripePriceId,
        stripeYearlyPriceId: plan.stripeYearlyPriceId,
        razorpayPlanId: plan.razorpayPlanId,
        razorpayYearlyPlanId: plan.razorpayYearlyPlanId,
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
      stripePriceId: parsed.data.stripePriceId ?? null,
      stripeYearlyPriceId: parsed.data.stripeYearlyPriceId ?? null,
      razorpayPlanId: parsed.data.razorpayPlanId ?? null,
      razorpayYearlyPlanId: parsed.data.razorpayYearlyPlanId ?? null,
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
