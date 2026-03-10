/**
 * @file use-checkout.ts
 * @module features/billing/hooks/use-checkout
 * Provider-aware checkout hook — handles Stripe redirect and Razorpay modal.
 */

'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

import { initiateCheckout } from '@/features/billing/actions'
import type { CheckoutInput } from '@/features/billing/types'
import type { CheckoutResult, RazorpayModalConfig } from '@/lib/payment/types'

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void
      close: () => void
    }
  }
}

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'

interface UseCheckoutReturn {
  checkout: (input: CheckoutInput) => Promise<void>
  isLoading: boolean
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = RAZORPAY_SCRIPT_URL
    script.onload = (): void => resolve(true)
    script.onerror = (): void => resolve(false)
    document.body.appendChild(script)
  })
}

export function useCheckout(): UseCheckoutReturn {
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()

  const openRazorpayModal = useCallback(
    async (config: RazorpayModalConfig): Promise<void> => {
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        toast.error('Failed to load payment gateway')
        return
      }

      const razorpay = new window.Razorpay({
        key: config.keyId,
        subscription_id: config.subscriptionId,
        name: config.name,
        description: config.description,
        prefill: config.prefill,
        notes: config.notes,
        handler: () => {
          toast.success('Payment successful! Your subscription is being activated.')
          void queryClient.invalidateQueries({ queryKey: ['billing'] })
        },
      })
      razorpay.open()
    },
    [queryClient],
  )

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
        await openRazorpayModal(checkoutResult.config)
      }
    } catch {
      toast.error('Something went wrong during checkout')
    } finally {
      setIsLoading(false)
    }
  }

  return { checkout, isLoading }
}
