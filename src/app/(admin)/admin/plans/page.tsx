/**
 * @file page.tsx
 * @module app/(admin)/admin/plans/page
 * Admin plan management page — thin wrapper for the PlanManagement feature component.
 */

import { PlanManagement } from '@/features/admin/components/plan-management'

export default function AdminPlansPage(): React.ReactNode {
  return <PlanManagement />
}
