/**
 * @file razorpay-checkout-modal.tsx
 * @module features/billing/components/razorpay-checkout-modal
 * Razorpay inline checkout modal — lazy-loaded, opens when config is provided.
 */

'use client'

import { useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

import type { RazorpayModalConfig } from '@/lib/payment/types'

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void
      close: () => void
    }
  }
}

interface RazorpayCheckoutModalProps {
  config: RazorpayModalConfig
  onClose: () => void
}

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'

export const RazorpayCheckoutModal = ({
  config,
  onClose,
}: RazorpayCheckoutModalProps): React.ReactNode => {
  const queryClient = useQueryClient()

  const loadScript = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }
      const script = document.createElement('script')
      script.src = RAZORPAY_SCRIPT_URL
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }, [])

  useEffect(() => {
    const openCheckout = async (): Promise<void> => {
      const loaded = await loadScript()
      if (!loaded) {
        toast.error('Failed to load payment gateway')
        onClose()
        return
      }

      const options = {
        key: config.keyId,
        subscription_id: config.subscriptionId,
        name: config.name,
        description: config.description,
        prefill: config.prefill,
        notes: config.notes,
        handler: () => {
          toast.success('Payment successful! Your subscription is being activated.')
          void queryClient.invalidateQueries({ queryKey: ['billing'] })
          onClose()
        },
        modal: {
          ondismiss: () => {
            onClose()
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    }

    void openCheckout()
  }, [config, loadScript, onClose, queryClient])

  return null
}
