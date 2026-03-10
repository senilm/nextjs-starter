/**
 * @file use-payment-provider.ts
 * @module features/billing/hooks/use-payment-provider
 * Hook to get the active payment provider name for conditional UI rendering.
 */

'use client'

import { useQuery } from '@tanstack/react-query'

import type { PaymentProviderName } from '@/lib/payment/types'
import { getPaymentProviderName } from '@/lib/payment'

export function usePaymentProvider(): {
  provider: PaymentProviderName | undefined
  isLoading: boolean
} {
  const { data, isLoading } = useQuery({
    queryKey: ['billing', 'provider'],
    queryFn: getPaymentProviderName,
    staleTime: Infinity,
  })

  return { provider: data, isLoading }
}
