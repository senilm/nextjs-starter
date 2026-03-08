/**
 * @file page.tsx
 * @module app/(dashboard)/dashboard/usage/page
 * Usage page — thin wrapper around UsagePage feature component.
 */

import type { Metadata } from 'next'

import { UsagePage } from '@/features/billing/components/usage-page'

export const metadata: Metadata = {
  title: 'Usage',
}

export default function UsageRoute(): React.ReactNode {
  return <UsagePage />
}
