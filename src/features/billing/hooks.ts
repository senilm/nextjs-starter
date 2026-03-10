/**
 * @file hooks.ts
 * @module features/billing/hooks
 * TanStack Query hook for subscription data via server actions.
 */

'use client'

import { useQuery } from '@tanstack/react-query'

import { getSubscription } from '@/features/billing/actions'
import type { SubscriptionWithPlan } from '@/features/billing/types'

export function useSubscription(): ReturnType<typeof useQuery<SubscriptionWithPlan>> {
  return useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: getSubscription,
  })
}
