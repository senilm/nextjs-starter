/**
 * @file plan-card.tsx
 * @module features/billing/components/plan-card
 * Current plan card with manage/change buttons.
 */

'use client'

import { motion } from 'motion/react'
import { format } from 'date-fns'
import { CreditCard, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { authClient } from '@/lib/auth-client'
import { useSubscription } from '@/features/billing/hooks'

export const PlanCard = (): React.ReactNode => {
  const { data: subscription, isLoading } = useSubscription()

  const handleManageBilling = async (): Promise<void> => {
    try {
      /* @ts-expect-error -- Better Auth Stripe client typing may not expose portal method */
      const { url } = await authClient.stripe.createPortalSession()
      if (url) window.location.href = url
    } catch {
      toast.error('Failed to open billing portal')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-40" />
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CreditCard className="size-5" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {subscription?.planName ?? 'Free'} Plan
                <Badge variant={subscription?.plan === 'free' ? 'secondary' : 'default'}>
                  {subscription?.status === 'trialing' ? 'Trial' : subscription?.plan === 'free' ? 'Free' : 'Active'}
                </Badge>
              </CardTitle>
              <CardDescription>
                {subscription?.cancelAtPeriodEnd && subscription?.periodEnd
                  ? `Cancels on ${format(subscription.periodEnd, 'MMM d, yyyy')}`
                  : subscription?.periodEnd
                    ? `Renews on ${format(subscription.periodEnd, 'MMM d, yyyy')}`
                    : 'No active subscription'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">Included features:</p>
              <ul className="mt-2 space-y-1">
                {subscription?.features.map((feature) => (
                  <li key={feature} className="text-sm text-muted-foreground">
                    &bull; {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-2">
              {subscription?.plan === 'free' ? (
                <Button onClick={handleManageBilling}>
                  Upgrade
                  <ExternalLink className="ml-1 size-4" />
                </Button>
              ) : (
                <Button variant="outline" onClick={handleManageBilling}>
                  Manage billing
                  <ExternalLink className="ml-1 size-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
