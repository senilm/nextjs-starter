/**
 * @file route.ts
 * @module app/api/webhooks/razorpay
 * Razorpay webhook endpoint — verifies HMAC signature and processes events.
 */

import { NextResponse } from 'next/server'

import { RazorpayProvider } from '@/lib/payment/providers/razorpay'
import { processWebhookResult } from '@/lib/payment/webhook-processor'

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const provider = new RazorpayProvider()
    const result = await provider.handleWebhook(request)
    await processWebhookResult(result)

    return NextResponse.json({ received: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook processing failed'

    if (message.startsWith('Unhandled Razorpay event')) {
      return NextResponse.json({ received: true, skipped: message })
    }

    return NextResponse.json({ error: message }, { status: 400 })
  }
}
