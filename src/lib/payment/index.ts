/**
 * @file index.ts
 * @module lib/payment
 * Payment provider factory — returns the configured provider instance.
 */

import type { PaymentProvider, PaymentProviderName } from '@/lib/payment/types'

export function getPaymentProviderName(): PaymentProviderName {
  const provider = process.env.PAYMENT_PROVIDER ?? 'stripe'
  if (provider !== 'stripe' && provider !== 'razorpay') {
    throw new Error(`Invalid PAYMENT_PROVIDER: ${provider}. Must be "stripe" or "razorpay".`)
  }
  return provider
}

export async function getPaymentProvider(): Promise<PaymentProvider> {
  const name = getPaymentProviderName()

  if (name === 'stripe') {
    const { StripeProvider } = await import('@/lib/payment/providers/stripe')
    return new StripeProvider()
  }

  const { RazorpayProvider } = await import('@/lib/payment/providers/razorpay')
  return new RazorpayProvider()
}
