/**
 * @file index.ts
 * @module lib/payment
 * Payment provider factory — returns the configured provider instance.
 */

import type { PaymentProvider, PaymentProviderName } from '@/lib/payment/types'

let cachedProvider: PaymentProvider | null = null

export function getPaymentProviderName(): PaymentProviderName {
  const provider = process.env.PAYMENT_PROVIDER ?? 'stripe'
  if (provider !== 'stripe' && provider !== 'razorpay') {
    throw new Error(`Invalid PAYMENT_PROVIDER: ${provider}. Must be "stripe" or "razorpay".`)
  }
  return provider
}

export async function getPaymentProvider(): Promise<PaymentProvider> {
  if (cachedProvider) return cachedProvider

  const name = getPaymentProviderName()

  if (name === 'stripe') {
    const { StripeProvider } = await import('@/lib/payment/providers/stripe')
    cachedProvider = new StripeProvider()
  } else {
    const { RazorpayProvider } = await import('@/lib/payment/providers/razorpay')
    cachedProvider = new RazorpayProvider()
  }

  return cachedProvider
}
