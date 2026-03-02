/**
 * @file activity-chart.tsx
 * @module features/dashboard/components/activity-chart
 * 30-day area chart showing project activity and page views.
 */

'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { motion } from 'motion/react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { ACTIVITY_CHART_CONFIG, ACTIVITY_CHART_DATA } from '@/features/dashboard/constants'

export const ActivityChart = (): React.ReactNode => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut', delay: 0.05 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Activity Overview</CardTitle>
          <CardDescription>Projects created and page views over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={ACTIVITY_CHART_CONFIG} className="h-[300px] w-full">
            <AreaChart data={ACTIVITY_CHART_DATA} accessibilityLayer>
              <defs>
                <linearGradient id="fillProjects" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-projects)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-projects)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-views)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-views)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="views"
                type="monotone"
                fill="url(#fillViews)"
                stroke="var(--color-views)"
                strokeWidth={2}
              />
              <Area
                dataKey="projects"
                type="monotone"
                fill="url(#fillProjects)"
                stroke="var(--color-projects)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </motion.div>
  )
}
