/**
 * @file types.ts
 * @module features/admin/types
 * Types for the admin feature — stats, users, plans, charts.
 */

export interface AdminStats {
  totalUsers: number
  activeSubscriptions: number
  mrr: number
  newSignups7d: number
  usersTrend: number
  subscriptionsTrend: number
  mrrTrend: number
  signupsTrend: number
}

export interface ChartDataPoint {
  label: string
  value: number
}

export interface RevenueChartData {
  month: string
  revenue: number
}

export interface SubscriptionChartData {
  plan: string
  count: number
  fill: string
}

export interface SignupChartData {
  day: string
  signups: number
}

export interface UserWithRole {
  id: string
  name: string
  email: string
  image: string | null
  isActive: boolean
  emailVerified: boolean
  role: { id: string; name: string } | null
  subscription: { plan: string; status: string | null } | null
  createdAt: Date
  updatedAt: Date
}

export interface UserDetail extends UserWithRole {
  twoFactorEnabled: boolean
  sessions: { id: string; ipAddress: string | null; userAgent: string | null; createdAt: Date }[]
  permissions: string[]
}

export interface UserFilters {
  search?: string
  roleId?: string | 'all'
  status?: 'active' | 'suspended' | 'all'
  page?: number
  limit?: number
}

export interface UsersResponse {
  users: UserWithRole[]
  total: number
  page: number
  totalPages: number
}

export interface PlanWithStats {
  id: string
  key: string
  name: string
  description: string | null
  monthlyPrice: number | null
  yearlyPrice: number | null
  trialDays: number | null
  limits: Record<string, number>
  features: string[]
  isActive: boolean
  subscriberCount: number
}

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}
