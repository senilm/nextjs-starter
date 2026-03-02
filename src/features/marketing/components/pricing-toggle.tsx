/**
 * @file pricing-toggle.tsx
 * @module features/marketing/components/pricing-toggle
 * Client component with monthly/yearly switch that renders plan cards.
 */

'use client'

import { useState } from 'react'

import { PLANS } from '@/lib/config'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PlanCard } from '@/features/marketing/components/plan-card'

export const PricingToggle = (): React.ReactNode => {
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly')

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
        {(Object.entries(PLANS) as [string, (typeof PLANS)[keyof typeof PLANS]][]).map(
          ([key, plan]) => (
            <PlanCard
              key={key}
              name={plan.name}
              description={plan.description}
              price={period === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
              period={period}
              features={plan.features}
              badge={'badge' in plan ? plan.badge : undefined}
              highlighted={key === 'pro'}
            />
          ),
        )}
      </div>
    </div>
  )
}
