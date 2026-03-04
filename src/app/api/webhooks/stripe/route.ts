/**
 * @file route.ts
 * @module app/api/webhooks/stripe
 * Stripe webhook endpoint — verifies signature and processes events.
 */

import { NextResponse } from 'next/server'

import { StripeProvider } from '@/lib/payment/providers/stripe'
import { processWebhookResult } from '@/lib/payment/webhook-processor'

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const provider = new StripeProvider()
    const result = await provider.handleWebhook(request)
    await processWebhookResult(result)

    return NextResponse.json({ received: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook processing failed'

    if (message.startsWith('Unhandled Stripe event')) {
      return NextResponse.json({ received: true, skipped: message })
    }

    return NextResponse.json({ error: message }, { status: 400 })
  }
}
