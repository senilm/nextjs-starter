/**
 * @file admin-plan-card.tsx
 * @module features/admin/components/admin-plan-card
 * Card displaying plan details — name, prices, limits, subscriber count, edit button.
 */

'use client'

import { motion } from 'motion/react'
import { Pencil, Users } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { PlanWithStats } from '@/features/admin/types'

interface AdminPlanCardProps {
  plan: PlanWithStats
  onEdit: (plan: PlanWithStats) => void
  canEdit: boolean
}

export const AdminPlanCard = ({ plan, onEdit, canEdit }: AdminPlanCardProps): React.ReactNode => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <Card className="relative">
        {!plan.isActive && (
          <div className="absolute right-4 top-4">
            <Badge variant="secondary">Inactive</Badge>
          </div>
        )}
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {plan.name}
            {plan.isActive && (
              <Badge variant="default" className="bg-emerald-600">
                Active
              </Badge>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{plan.description ?? 'No description'}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Monthly</p>
              <p className="text-lg font-bold">
                {plan.monthlyPrice !== null ? `$${plan.monthlyPrice}` : 'Free'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Yearly</p>
              <p className="text-lg font-bold">
                {plan.yearlyPrice !== null ? `$${plan.yearlyPrice}` : 'Free'}
              </p>
            </div>
            {plan.trialDays !== null && plan.trialDays > 0 && (
              <div>
                <p className="text-xs text-muted-foreground">Trial</p>
                <p className="text-lg font-bold">{plan.trialDays}d</p>
              </div>
            )}
          </div>

          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">Limits</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(plan.limits).map(([key, value]) => (
                <Badge key={key} variant="outline" className="text-xs">
                  {key}: {value}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">Features</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {plan.features.slice(0, 4).map((feature) => (
                <li key={feature}>- {feature}</li>
              ))}
              {plan.features.length > 4 && (
                <li className="text-xs">+{plan.features.length - 4} more</li>
              )}
            </ul>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="size-4" />
              {plan.subscriberCount} subscriber{plan.subscriberCount !== 1 ? 's' : ''}
            </div>
            {canEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(plan)}>
                <Pencil className="mr-2 size-3.5" />
                Edit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
