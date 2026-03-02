/**
 * @file feature-comparison-table.tsx
 * @module features/marketing/components/feature-comparison-table
 * Feature comparison matrix across plans with check/cross marks.
 */

import { Check, X } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const COMPARISON_FEATURES = [
  { name: 'Projects', free: '3', pro: '25', business: '100' },
  { name: 'Storage', free: '1 GB', pro: '10 GB', business: '50 GB' },
  { name: 'Community support', free: true, pro: true, business: true },
  { name: 'Priority support', free: false, pro: true, business: true },
  { name: 'Dedicated support', free: false, pro: false, business: true },
  { name: 'Basic analytics', free: true, pro: true, business: true },
  { name: 'Advanced analytics', free: false, pro: true, business: true },
  { name: 'Full analytics suite', free: false, pro: false, business: true },
  { name: 'Custom domain', free: false, pro: true, business: true },
  { name: 'API access', free: false, pro: true, business: true },
  { name: 'Team management', free: false, pro: false, business: true },
  { name: 'White-label option', free: false, pro: false, business: true },
] as const

const renderCell = (value: boolean | string): React.ReactNode => {
  if (typeof value === 'string') {
    return <span className="text-sm font-medium">{value}</span>
  }
  return value ? (
    <Check className="mx-auto size-4 text-primary" />
  ) : (
    <X className="mx-auto size-4 text-muted-foreground/40" />
  )
}

export const FeatureComparisonTable = (): React.ReactNode => {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/4">Feature</TableHead>
            <TableHead className="w-1/4 text-center">Free</TableHead>
            <TableHead className="w-1/4 text-center">Pro</TableHead>
            <TableHead className="w-1/4 text-center">Business</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {COMPARISON_FEATURES.map((feature) => (
            <TableRow key={feature.name}>
              <TableCell className="font-medium">{feature.name}</TableCell>
              <TableCell className="text-center">{renderCell(feature.free)}</TableCell>
              <TableCell className="text-center">{renderCell(feature.pro)}</TableCell>
              <TableCell className="text-center">{renderCell(feature.business)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
