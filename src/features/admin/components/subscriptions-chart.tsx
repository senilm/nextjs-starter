/**
 * @file subscriptions-chart.tsx
 * @module features/admin/components/subscriptions-chart
 * Plan distribution donut chart using Recharts PieChart.
 */

'use client'

import { Pie, PieChart, Cell } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { ChartSkeleton } from '@/components/shared/loading-skeleton'
import { LoadingTransition } from '@/components/shared/loading-transition'
import { useSubscriptionChart } from '@/features/admin/hooks'

const chartConfig = {
  free: { label: 'Free', color: 'hsl(var(--chart-1))' },
  pro: { label: 'Pro', color: 'hsl(var(--chart-2))' },
  business: { label: 'Business', color: 'hsl(var(--chart-3))' },
} satisfies ChartConfig

export const SubscriptionsChart = (): React.ReactNode => {
  const { data, isLoading } = useSubscriptionChart()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan Distribution</CardTitle>
        <CardDescription>Active subscriptions by plan</CardDescription>
      </CardHeader>
      <CardContent>
        <LoadingTransition isLoading={isLoading || !data} loader={<ChartSkeleton />}>
          {data && (
            <ChartContainer config={chartConfig} className="mx-auto h-[300px] w-full">
              <PieChart accessibilityLayer>
                <ChartTooltip content={<ChartTooltipContent nameKey="plan" />} />
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="plan"
                  innerRadius={60}
                  outerRadius={100}
                  strokeWidth={2}
                >
                  {data.map((entry) => (
                    <Cell key={entry.plan} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          )}
        </LoadingTransition>
      </CardContent>
    </Card>
  )
}
