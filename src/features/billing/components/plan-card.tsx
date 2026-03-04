/**
 * @file plan-card.tsx
 * @module features/billing/components/plan-card
 * Plan selection cards with provider-agnostic checkout.
 */

'use client'

import { motion } from 'motion/react'
import { useState } from 'react'
import { Check, Sparkles } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CardWithHeaderSkeleton } from '@/components/shared/loading-skeleton'
import { LoadingTransition } from '@/components/shared/loading-transition'
import { formatAmount } from '@/lib/payment/helpers'
import { useSubscription } from '@/features/billing/hooks'
import { useCheckout } from '@/features/billing/hooks/use-checkout'
import { getActivePlans } from '@/features/billing/actions'
import type { BillingInterval } from '@/lib/payment/types'

interface PlanDisplay {
  id: string
  key: string
  name: string
  description: string | null
  monthlyPrice: number | null
  yearlyPrice: number | null
  features: string[]
  isActive: boolean
}

export const PlanCard = (): React.ReactNode => {
  const { data: subscription, isLoading: subLoading } = useSubscription()
  const [interval, setInterval] = useState<BillingInterval>('monthly')
  const { checkout, isLoading: checkoutLoading } = useCheckout()

  const { data: plans, isLoading: plansLoading } = useQuery<PlanDisplay[]>({
    queryKey: ['plans', 'active'],
    queryFn: getActivePlans,
  })

  const isLoading = subLoading || plansLoading

  const handleUpgrade = async (planId: string): Promise<void> => {
    await checkout({ planId, interval })
  }

  return (
    <LoadingTransition
      isLoading={isLoading}
      loader={
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardWithHeaderSkeleton key={i} contentLines={4} />
          ))}
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Button
            variant={interval === 'monthly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInterval('monthly')}
          >
            Monthly
          </Button>
          <Button
            variant={interval === 'yearly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInterval('yearly')}
          >
            Yearly
            <Badge variant="secondary" className="ml-1">
              Save 17%
            </Badge>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {plans?.map((plan, index) => {
            const isCurrentPlan = subscription?.planKey === plan.key
            const price = interval === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice
            const isFree = plan.key === 'free'
            const isPopular = plan.key === 'pro'

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut', delay: index * 0.05 }}
              >
                <Card className={isPopular ? 'border-primary shadow-md' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{plan.name}</CardTitle>
                      {isPopular && (
                        <Badge>
                          <Sparkles className="mr-1 size-3" />
                          Popular
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="pt-2">
                      <span className="text-3xl font-bold">
                        {isFree ? 'Free' : formatAmount(price ?? 0, 'usd')}
                      </span>
                      {!isFree && (
                        <span className="text-sm text-muted-foreground">
                          /{interval === 'yearly' ? 'year' : 'month'}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <Check className="size-4 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6">
                      {isCurrentPlan ? (
                        <Button variant="outline" className="w-full" disabled>
                          Current Plan
                        </Button>
                      ) : isFree ? (
                        <Button variant="outline" className="w-full" disabled>
                          Free
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          variant={isPopular ? 'default' : 'outline'}
                          onClick={() => handleUpgrade(plan.id)}
                          loading={checkoutLoading}
                        >
                          {subscription?.planKey === 'free' ? 'Upgrade' : 'Change Plan'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </LoadingTransition>
  )
}
