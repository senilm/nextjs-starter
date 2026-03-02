/**
 * @file page.tsx
 * @module app/(dashboard)/dashboard/billing/page
 * Billing page — thin wrapper around BillingPage feature component.
 */

import type { Metadata } from 'next'

import { BillingPage } from '@/features/billing/components/billing-page'

export const metadata: Metadata = {
  title: 'Billing',
}

export default function BillingRoute(): React.ReactNode {
  return <BillingPage />
}
