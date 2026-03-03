/**
 * @file quick-actions.tsx
 * @module features/dashboard/components/quick-actions
 * Quick action cards for common tasks in a compact vertical layout.
 */

'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { Plus, Settings, CreditCard, Shield } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { paths } from '@/lib/paths'
import { usePermission } from '@/hooks/use-permission'

interface QuickAction {
  title: string
  description: string
  href: string
  icon: React.ElementType
  permission?: string
}

const ACTIONS: QuickAction[] = [
  {
    title: 'New Project',
    description: 'Create a new project',
    href: paths.dashboard.projects.list(),
    icon: Plus,
  },
  {
    title: 'Account Settings',
    description: 'Update your profile',
    href: paths.dashboard.settings(),
    icon: Settings,
  },
  {
    title: 'Billing',
    description: 'Manage your subscription',
    href: paths.dashboard.billing(),
    icon: CreditCard,
  },
  {
    title: 'Admin Panel',
    description: 'Manage users & roles',
    href: paths.admin.home(),
    icon: Shield,
    permission: 'admin.access',
  },
]

export const QuickActions = (): React.ReactNode => {
  return (
    <div className="grid grid-cols-1 gap-2">
      {ACTIONS.map((action, index) => (
        <QuickActionCard key={action.href} action={action} index={index} />
      ))}
    </div>
  )
}

interface QuickActionCardProps {
  action: QuickAction
  index: number
}

const QuickActionCard = ({ action, index }: QuickActionCardProps): React.ReactNode => {
  const hasAccess = usePermission(action.permission ?? '')
  if (action.permission && !hasAccess) return null

  const Icon = action.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut', delay: index * 0.05 }}
    >
      <Link href={action.href}>
        <Card className="transition-colors hover:bg-accent py-0">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium">{action.title}</p>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
