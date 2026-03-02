/**
 * @file hooks.ts
 * @module features/billing/hooks
 * TanStack Query hook for subscription data.
 */

'use client'

import { useQuery } from '@tanstack/react-query'

import { authClient } from '@/lib/auth-client'
import { PLANS, type PlanKey } from '@/lib/config'

export interface SubscriptionData {
  plan: PlanKey
  planName: string
  status: string
  cancelAtPeriodEnd: boolean
  periodEnd: Date | null
  limits: { projects: number; storage: number }
  features: readonly string[]
}

export function useSubscription(): ReturnType<typeof useQuery<SubscriptionData>> {
  return useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: async (): Promise<SubscriptionData> => {
      const { data } = await authClient.subscription.list()
      const active = data?.find(
        (s: { status?: string | null }) => s.status === 'active' || s.status === 'trialing',
      )

      const planKey = (active?.plan ?? 'free') as PlanKey
      const plan = PLANS[planKey] ?? PLANS.free

      return {
        plan: planKey,
        planName: plan.name,
        status: active?.status ?? 'active',
        cancelAtPeriodEnd: active?.cancelAtPeriodEnd ?? false,
        periodEnd: active?.periodEnd ? new Date(active.periodEnd) : null,
        limits: plan.limits,
        features: plan.features,
      }
    },
  })
}
