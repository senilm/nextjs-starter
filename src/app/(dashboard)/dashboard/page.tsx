/**
 * @file page.tsx
 * @module app/(dashboard)/dashboard/page
 * Dashboard home page — thin wrapper around DashboardHome feature component.
 */

import type { Metadata } from 'next'

import { DashboardHome } from '@/features/dashboard/components/dashboard-home'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default function DashboardPage(): React.ReactNode {
  return <DashboardHome />
}
