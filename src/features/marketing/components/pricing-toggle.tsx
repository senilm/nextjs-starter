/**
 * @file pricing-toggle.tsx
 * @module features/marketing/components/pricing-toggle
 * Client component with monthly/yearly switch that renders plan cards.
 */

'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PlanCard } from '@/features/marketing/components/plan-card'
import { getActivePlans } from '@/features/billing/actions'

export const PricingToggle = (): React.ReactNode => {
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const { data: plans } = useQuery({
    queryKey: ['plans', 'active'],
    queryFn: getActivePlans,
  })

  return (
    <div>
      <div className="mx-auto mb-10 flex w-fit rounded-lg bg-muted p-1">
        <Button
          variant="ghost"
          size="sm"
          className={cn(period === 'monthly' && 'bg-background shadow-sm')}
          onClick={() => setPeriod('monthly')}
        >
          Monthly
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(period === 'yearly' && 'bg-background shadow-sm')}
          onClick={() => setPeriod('yearly')}
        >
          Yearly
          <span className="ml-1 text-xs text-primary">Save 20%</span>
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {plans?.map((plan) => (
          <PlanCard
            key={plan.id}
            name={plan.name}
            description={plan.description ?? ''}
            price={
              period === 'monthly'
                ? Math.round((plan.monthlyPrice ?? 0) / 100)
                : Math.round((plan.yearlyPrice ?? 0) / 100)
            }
            period={period}
            features={plan.features}
            highlighted={plan.key === 'pro'}
          />
        ))}
      </div>
    </div>
  )
}
