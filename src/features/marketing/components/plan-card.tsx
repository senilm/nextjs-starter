/**
 * @file plan-card.tsx
 * @module features/marketing/components/plan-card
 * Pricing plan card with name, price, features, and CTA button.
 */

import Link from 'next/link'
import { Check } from 'lucide-react'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface PlanCardProps {
  name: string
  description: string
  price: number
  period: 'monthly' | 'yearly'
  features: readonly string[]
  badge?: string
  highlighted?: boolean
}

export const PlanCard = ({
  name,
  description,
  price,
  period,
  features,
  badge,
  highlighted = false,
}: PlanCardProps): React.ReactNode => {
  const isFree = price === 0

  return (
    <Card
      className={cn(
        'relative flex flex-col',
        highlighted && 'border-primary shadow-lg',
      )}
    >
      {badge && (
        <Badge className="absolute -top-3 right-4">
          {badge}
        </Badge>
      )}
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold">${price}</span>
          {!isFree && (
            <span className="text-muted-foreground">
              /{period === 'monthly' ? 'mo' : 'yr'}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={highlighted ? 'default' : 'outline'}
          asChild
        >
          <Link href="/sign-up">
            {isFree ? 'Get Started Free' : 'Start Free Trial'}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
