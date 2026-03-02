/**
 * @file signups-chart.tsx
 * @module features/admin/components/signups-chart
 * 7-day signups area chart using Recharts AreaChart.
 */

'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { useSignupChart } from '@/features/admin/hooks'

const chartConfig = {
  signups: { label: 'Signups', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig

export const SignupsChart = (): React.ReactNode => {
  const { data, isLoading } = useSignupChart()

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Signups</CardTitle>
        <CardDescription>Daily signups over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading || !data ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart data={data} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="signups"
                type="monotone"
                fill="var(--color-signups)"
                fillOpacity={0.2}
                stroke="var(--color-signups)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
