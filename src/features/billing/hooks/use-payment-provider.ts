/**
 * @file use-payment-provider.ts
 * @module features/billing/hooks/use-payment-provider
 * Hook to get the active payment provider name for conditional UI rendering.
 */

'use client'

import { useQuery } from '@tanstack/react-query'

import { getActivePaymentProvider } from '@/features/billing/actions'
import type { PaymentProviderName } from '@/lib/payment/types'

export function usePaymentProvider(): {
  provider: PaymentProviderName | undefined
  isLoading: boolean
} {
  const { data, isLoading } = useQuery({
    queryKey: ['billing', 'provider'],
    queryFn: getActivePaymentProvider,
    staleTime: Infinity,
  })

  return { provider: data, isLoading }
}
