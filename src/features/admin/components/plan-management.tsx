/**
 * @file plan-management.tsx
 * @module features/admin/components/plan-management
 * Admin plan management container — plan cards grid with edit dialog.
 */

'use client'

import { Palette } from 'lucide-react'

import { PageHeader } from '@/components/shared/page-header'
import { StatsRowSkeleton } from '@/components/shared/loading-skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { LoadingTransition } from '@/components/shared/loading-transition'
import { useDialogStore, DIALOG_KEY } from '@/stores/dialog-store'
import { usePermission } from '@/hooks/use-permission'
import { usePlans } from '@/features/admin/hooks'
import { AdminPlanCard } from '@/features/admin/components/admin-plan-card'

export const PlanManagement = (): React.ReactNode => {
  const { openDialog } = useDialogStore()
  const canEdit = usePermission('plans.edit')
  const { data: plans, isLoading } = usePlans()

  return (
    <div className="space-y-6">
      <PageHeader title="Plans" description="View and manage subscription plans." />

      <LoadingTransition isLoading={isLoading} loader={<StatsRowSkeleton count={3} />}>
        {!plans?.length ? (
          <EmptyState icon={Palette} title="No plans found" description="Plans will appear here once configured." />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <AdminPlanCard key={plan.id} plan={plan} onEdit={(p) => openDialog(DIALOG_KEY.EDIT_PLAN, p)} canEdit={canEdit} />
            ))}
          </div>
        )}
      </LoadingTransition>
    </div>
  )
}
