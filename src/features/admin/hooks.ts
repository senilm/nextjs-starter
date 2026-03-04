/**
 * @file hooks.ts
 * @module features/admin/hooks
 * TanStack Query hooks for admin panel data fetching and mutations.
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  getAdminStats,
  getRevenueChartData,
  getSubscriptionChartData,
  getSignupChartData,
  getUsers,
  getUserDetail,
  changeUserRole,
  suspendUser,
  unsuspendUser,
  deleteUser,
  inviteUser,
  getPlans,
  updatePlan,
  getSystemSettings,
  updateSystemSettings,
} from '@/features/admin/actions'
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
import type { InviteUserInput, UpdatePlanInput, SystemSettingsInput } from '@/features/admin/validations'

const ADMIN_KEY = ['admin'] as const
const USERS_KEY = ['admin', 'users'] as const
const PLANS_KEY = ['admin', 'plans'] as const
const SETTINGS_KEY = ['admin', 'settings'] as const

export function useAdminStats(): ReturnType<typeof useQuery<AdminStats>> {
  return useQuery({
    queryKey: [...ADMIN_KEY, 'stats'],
    queryFn: () => getAdminStats(),
  })
}

export function useRevenueChart(): ReturnType<typeof useQuery<RevenueChartData[]>> {
  return useQuery({
    queryKey: [...ADMIN_KEY, 'revenue-chart'],
    queryFn: () => getRevenueChartData(),
  })
}

export function useSubscriptionChart(): ReturnType<typeof useQuery<SubscriptionChartData[]>> {
  return useQuery({
    queryKey: [...ADMIN_KEY, 'subscription-chart'],
    queryFn: () => getSubscriptionChartData(),
  })
}

export function useSignupChart(): ReturnType<typeof useQuery<SignupChartData[]>> {
  return useQuery({
    queryKey: [...ADMIN_KEY, 'signup-chart'],
    queryFn: () => getSignupChartData(),
  })
}

export function useUsers(filters: UserFilters): ReturnType<typeof useQuery<UsersResponse>> {
  return useQuery({
    queryKey: [...USERS_KEY, filters],
    queryFn: () => getUsers(filters),
  })
}

export function useUserDetail(userId: string | null): ReturnType<typeof useQuery<UserDetail | null>> {
  return useQuery({
    queryKey: [...USERS_KEY, 'detail', userId],
    queryFn: () => (userId ? getUserDetail(userId) : null),
    enabled: !!userId,
  })
}

export function useChangeUserRole(): ReturnType<
  typeof useMutation<ActionResult, Error, { userId: string; roleId: string }>
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) => changeUserRole(userId, roleId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Role updated')
        void queryClient.invalidateQueries({ queryKey: USERS_KEY })
      } else {
        toast.error(result.error ?? 'Failed to update role')
      }
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_KEY })
      toast.error('Failed to update role')
    },
  })
}

export function useSuspendUser(): ReturnType<typeof useMutation<ActionResult, Error, string>> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => suspendUser(userId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('User suspended')
        void queryClient.invalidateQueries({ queryKey: USERS_KEY })
      } else {
        toast.error(result.error ?? 'Failed to suspend user')
      }
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_KEY })
      toast.error('Failed to suspend user')
    },
  })
}

export function useUnsuspendUser(): ReturnType<typeof useMutation<ActionResult, Error, string>> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => unsuspendUser(userId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('User unsuspended')
        void queryClient.invalidateQueries({ queryKey: USERS_KEY })
      } else {
        toast.error(result.error ?? 'Failed to unsuspend user')
      }
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_KEY })
      toast.error('Failed to unsuspend user')
    },
  })
}

export function useDeleteUser(): ReturnType<typeof useMutation<ActionResult, Error, string>> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('User deleted')
        void queryClient.invalidateQueries({ queryKey: USERS_KEY })
      } else {
        toast.error(result.error ?? 'Failed to delete user')
      }
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_KEY })
      toast.error('Failed to delete user')
    },
  })
}

export function useInviteUser(): ReturnType<typeof useMutation<ActionResult, Error, InviteUserInput>> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: InviteUserInput) => inviteUser(input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Invitation sent')
        void queryClient.invalidateQueries({ queryKey: USERS_KEY })
      } else {
        toast.error(result.error ?? 'Failed to send invitation')
      }
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_KEY })
      toast.error('Failed to send invitation')
    },
  })
}

export function usePlans(): ReturnType<typeof useQuery<PlanWithStats[]>> {
  return useQuery({
    queryKey: PLANS_KEY,
    queryFn: () => getPlans(),
  })
}

export function useUpdatePlan(): ReturnType<typeof useMutation<ActionResult, Error, UpdatePlanInput>> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdatePlanInput) => updatePlan(input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Plan updated')
        void queryClient.invalidateQueries({ queryKey: PLANS_KEY })
      } else {
        toast.error(result.error ?? 'Failed to update plan')
      }
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: PLANS_KEY })
      toast.error('Failed to update plan')
    },
  })
}

export function useSystemSettings(): ReturnType<
  typeof useQuery<{
    id: string
    siteName: string
    siteUrl: string
    supportEmail: string
    announcementBar: string | null
    maintenanceMode: boolean
  }>
> {
  return useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: () => getSystemSettings(),
  })
}

export function useUpdateSystemSettings(): ReturnType<
  typeof useMutation<ActionResult, Error, SystemSettingsInput>
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SystemSettingsInput) => updateSystemSettings(input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Settings updated')
        void queryClient.invalidateQueries({ queryKey: SETTINGS_KEY })
      } else {
        toast.error(result.error ?? 'Failed to update settings')
      }
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: SETTINGS_KEY })
      toast.error('Failed to update settings')
    },
  })
}
