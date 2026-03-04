/**
 * @file payment-history.tsx
 * @module features/billing/components/payment-history
 * Payment history table from local database records.
 */

'use client'

import { motion } from 'motion/react'
import { ExternalLink, Receipt } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardWithHeaderSkeleton } from '@/components/shared/loading-skeleton'
import { LoadingTransition } from '@/components/shared/loading-transition'
import { formatDate } from '@/lib/format'
import { formatAmount } from '@/lib/payment/helpers'
import { getPaymentHistory } from '@/features/billing/actions'
import type { PaymentRecord } from '@/features/billing/types'

const STATUS_VARIANT: Record<string, 'default' | 'destructive' | 'secondary'> = {
  succeeded: 'default',
  failed: 'destructive',
  refunded: 'secondary',
}

export const PaymentHistory = (): React.ReactNode => {
  const { data: payments, isLoading } = useQuery<PaymentRecord[]>({
    queryKey: ['billing', 'payments'],
    queryFn: getPaymentHistory,
  })

  return (
    <LoadingTransition
      isLoading={isLoading}
      loader={<CardWithHeaderSkeleton contentLines={3} />}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut', delay: 0.15 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Receipt className="size-5" />
              </div>
              <div>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Your recent payments and invoices.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!payments?.length ? (
              <p className="text-sm text-muted-foreground">No payments yet.</p>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{payment.planName}</span>
                        <Badge variant={STATUS_VARIANT[payment.status] ?? 'secondary'}>
                          {payment.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground capitalize">
                          {payment.interval}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(payment.paidAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">
                        {formatAmount(payment.amount, payment.currency)}
                      </span>
                      {payment.invoiceUrl && (
                        <Button variant="ghost" size="icon-xs" asChild>
                          <a
                            href={payment.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="size-3.5" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </LoadingTransition>
  )
}
