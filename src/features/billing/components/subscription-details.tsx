/**
 * @file subscription-details.tsx
 * @module features/billing/components/subscription-details
 * Subscription status card with cancel/resume actions.
 */

'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { CreditCard, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CardWithHeaderSkeleton } from '@/components/shared/loading-skeleton'
import { LoadingTransition } from '@/components/shared/loading-transition'
import { formatDate } from '@/lib/format'
import { useSubscription } from '@/features/billing/hooks'
import {
  cancelSubscription,
  resumeSubscription,
  getUpdatePaymentMethodUrl,
} from '@/features/billing/actions'

export const SubscriptionDetails = (): React.ReactNode => {
  const { data: subscription, isLoading, refetch } = useSubscription()
  const [isCanceling, setIsCanceling] = useState(false)
  const [isResuming, setIsResuming] = useState(false)

  const isFreePlan = subscription?.planKey === 'free'
  const isPaid = !isFreePlan && subscription?.provider

  const handleCancel = async (): Promise<void> => {
    setIsCanceling(true)
    try {
      const result = await cancelSubscription()
      if (result.success) {
        toast.success('Subscription will cancel at end of billing period')
        await refetch()
      } else {
        toast.error(result.error ?? 'Failed to cancel subscription')
      }
    } catch {
      toast.error('Failed to cancel subscription')
    } finally {
      setIsCanceling(false)
    }
  }

  const handleResume = async (): Promise<void> => {
    setIsResuming(true)
    try {
      const result = await resumeSubscription()
      if (result.success) {
        toast.success('Subscription resumed')
        await refetch()
      } else {
        toast.error(result.error ?? 'Failed to resume subscription')
      }
    } catch {
      toast.error('Failed to resume subscription')
    } finally {
      setIsResuming(false)
    }
  }

  const handleUpdatePayment = async (): Promise<void> => {
    try {
      const result = await getUpdatePaymentMethodUrl()
      if (result.success && result.data) {
        window.location.href = result.data
      } else {
        toast.error('Payment method update not available for this provider')
      }
    } catch {
      toast.error('Failed to get payment update link')
    }
  }

  return (
    <LoadingTransition
      isLoading={isLoading}
      loader={<CardWithHeaderSkeleton contentLines={2} />}
    >
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
                  <Badge variant={isFreePlan ? 'secondary' : 'default'}>
                    {subscription?.status === 'trialing'
                      ? 'Trial'
                      : isFreePlan
                        ? 'Free'
                        : 'Active'}
                  </Badge>
                  {subscription?.cancelAtPeriodEnd && (
                    <Badge variant="destructive">Canceling</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {subscription?.cancelAtPeriodEnd && subscription?.periodEnd
                    ? `Cancels on ${formatDate(subscription.periodEnd)}`
                    : subscription?.periodEnd
                      ? `Renews on ${formatDate(subscription.periodEnd)}`
                      : 'No active billing period'}
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
              {isPaid && (
                <div className="flex flex-wrap gap-2">
                  {subscription?.cancelAtPeriodEnd ? (
                    <Button
                      variant="outline"
                      onClick={handleResume}
                      loading={isResuming}
                    >
                      Resume Subscription
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      loading={isCanceling}
                    >
                      Cancel Subscription
                    </Button>
                  )}
                  <Button variant="ghost" onClick={handleUpdatePayment}>
                    Update Payment Method
                    <ExternalLink className="ml-1 size-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </LoadingTransition>
  )
}
