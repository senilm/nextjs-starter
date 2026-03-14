/**
 * @file actions.ts
 * @module features/admin/actions
 * Server actions for the admin panel — stats, charts, user management, plans, settings.
 */

'use server'

import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { subDays, subMonths, startOfDay, startOfMonth, format } from 'date-fns'

import { requirePermission } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { invalidateUserSessions } from '@/lib/rbac'
import { logAudit, getClientIp } from '@/lib/audit'
import { Module, AuditAction, PAGINATION } from '@/lib/constants'
import { APP_URL } from '@/lib/config'
import { paths } from '@/lib/paths'
import { sendEmail } from '@/features/email/send'
import { parseInput } from '@/lib/zod-presets'
import { inviteUserSchema, updatePlanSchema, systemSettingsSchema } from '@/features/admin/validations'
import type { ActionResult } from '@/types/shared'
import type {
  AdminStats,
  RevenueChartData,
  SubscriptionChartData,
  SignupChartData,
  UserFilters,
  UsersResponse,
  UserDetail,
  PlanWithStats,
} from '@/features/admin/types'

const CHART_PLAN_COLORS: Record<string, string> = {
  free: '#e26600',
  pro: '#d79628',
  business: '#3c7ebe',
}
const MONTHS_IN_CHART = 12
const DAYS_IN_SIGNUPS_CHART = 7


export async function getAdminStats(): Promise<AdminStats> {
  await requirePermission('admin.access')

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
  await requirePermission('admin.access')

  const now = new Date()
  const months = Array.from({ length: MONTHS_IN_CHART }, (_, idx) => {
    const i = MONTHS_IN_CHART - 1 - idx
    return {
      start: startOfMonth(subMonths(now, i)),
      end: startOfMonth(subMonths(now, i - 1)),
    }
  })

  const results = await Promise.all(
    months.map(({ start, end }) =>
      prisma.payment.aggregate({
        where: { status: 'succeeded', paidAt: { gte: start, lt: end } },
        _sum: { amount: true },
      }),
    ),
  )

  return months.map(({ start }, idx) => ({
    month: format(start, 'MMM'),
    revenue: Math.round((results[idx]!._sum.amount ?? 0) / 100),
  }))
}

export async function getSubscriptionChartData(): Promise<SubscriptionChartData[]> {
  await requirePermission('admin.access')

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
    fill: CHART_PLAN_COLORS[plan] ?? '#8cbe81',
  }))
}

export async function getSignupChartData(): Promise<SignupChartData[]> {
  await requirePermission('admin.access')

  const now = new Date()
  const days = Array.from({ length: DAYS_IN_SIGNUPS_CHART }, (_, idx) => {
    const i = DAYS_IN_SIGNUPS_CHART - 1 - idx
    return {
      start: startOfDay(subDays(now, i)),
      end: startOfDay(subDays(now, i - 1)),
    }
  })

  const results = await Promise.all(
    days.map(({ start, end }) =>
      prisma.user.count({
        where: { deletedAt: null, createdAt: { gte: start, lt: end } },
      }),
    ),
  )

  return days.map(({ start }, idx) => ({
    day: format(start, 'EEE'),
    signups: results[idx]!,
  }))
}

export async function getUsers(filters: UserFilters = {}): Promise<UsersResponse> {
  await requirePermission('users.view')

  const page = filters.page ?? PAGINATION.DEFAULT_PAGE
  const limit = Math.min(filters.limit ?? PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT)
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
  await requirePermission('users.view')

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
  const session = await requirePermission('users.edit')
  if (userId === session.user.id) return { success: false, error: 'Cannot change your own role' }

  const [targetUser, role] = await Promise.all([
    prisma.user.findFirst({ where: { id: userId, deletedAt: null }, include: { role: { select: { name: true } } } }),
    prisma.role.findFirst({ where: { id: roleId, deletedAt: null } }),
  ])
  if (!role) return { success: false, error: 'Role not found' }

  await prisma.user.update({ where: { id: userId }, data: { roleId } })
  await invalidateUserSessions(userId)

  const ip = await getClientIp()
  after(async () => {
    await logAudit({
      module: Module.Users,
      action: AuditAction.RoleChanged,
      recordId: userId,
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      userRole: session.user.role?.name,
      previousValues: { role: targetUser?.role?.name },
      newValues: { role: role.name },
      ipAddress: ip,
    })
  })

  revalidatePath('/admin/users')
  return { success: true }
}

export async function suspendUser(userId: string): Promise<ActionResult> {
  const session = await requirePermission('users.edit')
  if (userId === session.user.id) return { success: false, error: 'Cannot suspend yourself' }

  await prisma.user.update({ where: { id: userId }, data: { isActive: false } })
  await invalidateUserSessions(userId)

  const ip = await getClientIp()
  after(async () => {
    await logAudit({
      module: Module.Users,
      action: AuditAction.Suspended,
      recordId: userId,
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      userRole: session.user.role?.name,
      ipAddress: ip,
    })
  })

  revalidatePath('/admin/users')
  return { success: true }
}

export async function unsuspendUser(userId: string): Promise<ActionResult> {
  const session = await requirePermission('users.edit')

  await prisma.user.update({ where: { id: userId }, data: { isActive: true } })

  const ip = await getClientIp()
  after(async () => {
    await logAudit({
      module: Module.Users,
      action: AuditAction.Unsuspended,
      recordId: userId,
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      userRole: session.user.role?.name,
      ipAddress: ip,
    })
  })

  revalidatePath('/admin/users')
  return { success: true }
}

export async function deleteUser(userId: string): Promise<ActionResult> {
  const session = await requirePermission('users.delete')
  if (userId === session.user.id) return { success: false, error: 'Cannot delete yourself' }

  const targetUser = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: { name: true, email: true },
  })

  await prisma.user.update({ where: { id: userId }, data: { deletedAt: new Date() } })
  await invalidateUserSessions(userId)

  const ip = await getClientIp()
  after(async () => {
    await logAudit({
      module: Module.Users,
      action: AuditAction.Deleted,
      recordId: userId,
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      userRole: session.user.role?.name,
      previousValues: targetUser ? { name: targetUser.name, email: targetUser.email } : undefined,
      ipAddress: ip,
    })
  })

  revalidatePath('/admin/users')
  return { success: true }
}

export async function bulkDeleteUsers(userIds: string[]): Promise<ActionResult> {
  const session = await requirePermission('users.delete')

  if (userIds.includes(session.user.id)) {
    return { success: false, error: 'Cannot include yourself in bulk delete' }
  }

  try {
    await prisma.$transaction(async (tx) => {
      const count = await tx.user.count({
        where: { id: { in: userIds }, deletedAt: null },
      })

      if (count !== userIds.length) {
        throw new Error('One or more users not found')
      }

      await tx.user.updateMany({
        where: { id: { in: userIds }, deletedAt: null },
        data: { deletedAt: new Date() },
      })
    })
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete users' }
  }

  await Promise.all(userIds.map((id) => invalidateUserSessions(id)))

  const ip = await getClientIp()
  after(async () => {
    await logAudit({
      module: Module.Users,
      action: AuditAction.BulkDeleted,
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      userRole: session.user.role?.name,
      newValues: { userIds, count: userIds.length },
      ipAddress: ip,
    })
  })

  revalidatePath('/admin/users')
  return { success: true }
}

export async function inviteUser(input: unknown): Promise<ActionResult> {
  const session = await requirePermission('users.create')

  const parsed = parseInput(inviteUserSchema, input)
  if (!parsed.success) return parsed

  const existing = await prisma.user.findFirst({
    where: { email: parsed.data.email, deletedAt: null },
  })
  if (existing) return { success: false, error: 'User with this email already exists' }

  const { nanoid } = await import('nanoid')
  const INVITATION_EXPIRY_DAYS = 7
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

  const ip = await getClientIp()
  after(async () => {
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

    await logAudit({
      module: Module.Users,
      action: AuditAction.Invited,
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      userRole: session.user.role?.name,
      newValues: { email: parsed.data.email, role: role?.name },
      ipAddress: ip,
    })
  })

  revalidatePath('/admin/users')
  return { success: true }
}

export async function getPlans(): Promise<PlanWithStats[]> {
  await requirePermission('plans.view')

  const plans = await prisma.plan.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      _count: { select: { subscriptions: { where: { status: 'active' } } } },
    },
  })

  return plans.map((plan) => ({
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
    subscriberCount: plan._count.subscriptions,
  }))
}

export async function updatePlan(input: unknown): Promise<ActionResult> {
  const session = await requirePermission('plans.edit')

  const parsed = parseInput(updatePlanSchema, input)
  if (!parsed.success) return parsed

  const existing = await prisma.plan.findUnique({ where: { id: parsed.data.id } })

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

  const ip = await getClientIp()
  after(async () => {
    await logAudit({
      module: Module.Plans,
      action: AuditAction.Updated,
      recordId: parsed.data.id,
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      userRole: session.user.role?.name,
      previousValues: existing ? { name: existing.name, isActive: existing.isActive } : undefined,
      newValues: { name: parsed.data.name, isActive: parsed.data.isActive },
      ipAddress: ip,
    })
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
  await requirePermission('settings.view')

  const settings = await prisma.systemSettings.findFirst()
  if (!settings) {
    const created = await prisma.systemSettings.create({ data: {} })
    return created
  }
  return settings
}

export async function updateSystemSettings(input: unknown): Promise<ActionResult> {
  const session = await requirePermission('settings.edit')

  const parsed = parseInput(systemSettingsSchema, input)
  if (!parsed.success) return parsed

  const settings = await prisma.systemSettings.findFirst()
  const previousValues = settings
    ? {
        siteName: settings.siteName,
        siteUrl: settings.siteUrl,
        supportEmail: settings.supportEmail,
        maintenanceMode: settings.maintenanceMode,
      }
    : undefined

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

  const ip = await getClientIp()
  after(async () => {
    await logAudit({
      module: Module.Settings,
      action: AuditAction.Updated,
      recordId: settings?.id,
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      userRole: session.user.role?.name,
      previousValues,
      newValues: {
        siteName: parsed.data.siteName,
        siteUrl: parsed.data.siteUrl,
        supportEmail: parsed.data.supportEmail,
        maintenanceMode: parsed.data.maintenanceMode,
      },
      ipAddress: ip,
    })
  })

  revalidatePath('/admin/settings')
  return { success: true }
}
