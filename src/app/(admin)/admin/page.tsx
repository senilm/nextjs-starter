/**
 * @file page.tsx
 * @module app/(admin)/admin/page
 * Admin dashboard page — thin wrapper for the AdminDashboard feature component.
 */

import { AdminDashboard } from '@/features/admin/components/admin-dashboard'

export default function AdminPage(): React.ReactNode {
  return <AdminDashboard />
}
