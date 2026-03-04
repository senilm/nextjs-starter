/**
 * @file revenue-chart.tsx
 * @module features/admin/components/revenue-chart
 * 12-month MRR bar chart using Recharts + Shadcn ChartContainer.
 */

'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { ChartSkeleton } from '@/components/shared/loading-skeleton'
import { LoadingTransition } from '@/components/shared/loading-transition'
import { useRevenueChart } from '@/features/admin/hooks'

const chartConfig = {
  revenue: { label: 'Revenue', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig

export const RevenueChart = (): React.ReactNode => {
  const { data, isLoading } = useRevenueChart()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Revenue</CardTitle>
        <CardDescription>MRR over the last 12 months</CardDescription>
      </CardHeader>
      <CardContent>
        <LoadingTransition isLoading={isLoading || !data} loader={<ChartSkeleton />}>
          {data && (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={data} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${v}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </LoadingTransition>
      </CardContent>
    </Card>
  )
}
