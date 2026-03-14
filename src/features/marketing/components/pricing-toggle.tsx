/**
 * @file pricing-toggle.tsx
 * @module features/marketing/components/pricing-toggle
 * Client component with monthly/yearly switch that renders plan cards.
 */

'use client'

import { useQuery } from '@tanstack/react-query'

import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent, TabsContents } from '@/components/ui/tabs'
import { PlanCard } from '@/features/marketing/components/plan-card'
import { getActivePlans } from '@/features/billing/actions'

export const PricingToggle = (): React.ReactNode => {
  const { data: plans } = useQuery({
    queryKey: ['plans', 'active'],
    queryFn: getActivePlans,
  })

  return (
    <Tabs defaultValue="monthly">
      <TabsList className="mx-auto mb-10">
        <TabsTrigger value="monthly">Monthly</TabsTrigger>
        <TabsTrigger value="yearly">
          Yearly
          <Badge variant="accent" className="ml-1.5 text-[10px] px-1.5 py-0">Save 20%</Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContents>
        <TabsContent value="monthly">
          <div className="grid gap-8 md:grid-cols-3">
            {plans?.map((plan) => (
              <PlanCard
                key={plan.id}
                name={plan.name}
                description={plan.description ?? ''}
                price={Math.round((plan.monthlyPrice ?? 0) / 100)}
                period="monthly"
                features={plan.features as string[]}
                highlighted={plan.key === 'pro'}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="yearly">
          <div className="grid gap-8 md:grid-cols-3">
            {plans?.map((plan) => (
              <PlanCard
                key={plan.id}
                name={plan.name}
                description={plan.description ?? ''}
                price={Math.round((plan.yearlyPrice ?? 0) / 100)}
                period="yearly"
                features={plan.features as string[]}
                highlighted={plan.key === 'pro'}
              />
            ))}
          </div>
        </TabsContent>
      </TabsContents>
    </Tabs>
  )
}
