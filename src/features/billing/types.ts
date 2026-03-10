/**
 * @file types.ts
 * @module features/billing/types
 * Billing-specific types for subscription and payment data.
 */

import { Prisma } from "@prisma/client"

export type SubscriptionWithPlan = Prisma.SubscriptionGetPayload<{
  include: { plan: true }
}>

export type PaymentWithPlan = Prisma.PaymentGetPayload<{
  include: { plan: { select: { name: true } } }
}>


export interface CheckoutInput {
  planId: string
  interval: 'monthly' | 'yearly'
}

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}
