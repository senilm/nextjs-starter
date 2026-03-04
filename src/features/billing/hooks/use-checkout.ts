/**
 * @file use-checkout.ts
 * @module features/billing/hooks/use-checkout
 * Provider-aware checkout hook — handles Stripe redirect and Razorpay modal.
 */

'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { initiateCheckout } from '@/features/billing/actions'
import type { CheckoutInput } from '@/features/billing/types'
import type { CheckoutResult, RazorpayModalConfig } from '@/lib/payment/types'

interface UseCheckoutReturn {
  checkout: (input: CheckoutInput) => Promise<void>
  isLoading: boolean
  razorpayConfig: RazorpayModalConfig | null
  clearRazorpayConfig: () => void
}

export function useCheckout(): UseCheckoutReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [razorpayConfig, setRazorpayConfig] = useState<RazorpayModalConfig | null>(null)

  const checkout = async (input: CheckoutInput): Promise<void> => {
    setIsLoading(true)
    try {
      const result = await initiateCheckout(input)
      if (!result.success || !result.data) {
        toast.error(result.error ?? 'Checkout failed')
        return
      }

      const checkoutResult: CheckoutResult = result.data

      if (checkoutResult.type === 'redirect') {
        window.location.href = checkoutResult.url
      } else {
        setRazorpayConfig(checkoutResult.config)
      }
    } catch {
      toast.error('Something went wrong during checkout')
    } finally {
      setIsLoading(false)
    }
  }

  const clearRazorpayConfig = (): void => {
    setRazorpayConfig(null)
  }

  return { checkout, isLoading, razorpayConfig, clearRazorpayConfig }
}
