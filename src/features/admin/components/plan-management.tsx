/**
 * @file plan-management.tsx
 * @module features/admin/components/plan-management
 * Admin plan management container — plan cards grid with edit dialog.
 */

'use client'

import { useState } from 'react'
import { Palette } from 'lucide-react'

import { PageHeader } from '@/components/shared/page-header'
import { StatsRowSkeleton } from '@/components/shared/loading-skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { usePermission } from '@/hooks/use-permission'
import { usePlans } from '@/features/admin/hooks'
import { AdminPlanCard } from '@/features/admin/components/admin-plan-card'
import { EditPlanDialog } from '@/features/admin/components/edit-plan-dialog'
import type { PlanWithStats } from '@/features/admin/types'

export const PlanManagement = (): React.ReactNode => {
  const canEdit = usePermission('plans.edit')
  const { data: plans, isLoading } = usePlans()
  const [editPlan, setEditPlan] = useState<PlanWithStats | null>(null)

  return (
    <div className="space-y-6">
      <PageHeader title="Plans" description="View and manage subscription plans." />

      {isLoading ? (
        <StatsRowSkeleton count={3} />
      ) : !plans?.length ? (
        <EmptyState icon={Palette} title="No plans found" description="Plans will appear here once configured." />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <AdminPlanCard key={plan.id} plan={plan} onEdit={setEditPlan} canEdit={canEdit} />
          ))}
        </div>
      )}

      <EditPlanDialog plan={editPlan} open={!!editPlan} onOpenChange={(open) => !open && setEditPlan(null)} />
    </div>
  )
}
