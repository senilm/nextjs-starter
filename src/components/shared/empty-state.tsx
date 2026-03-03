/**
 * @file empty-state.tsx
 * @module components/shared/empty-state
 * Empty state with icon, title, description, and optional action slot.
 */

'use client'

import { motion } from 'motion/react'
import { Inbox, type LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export const EmptyState = ({ icon: Icon = Inbox, title, description, action }: EmptyStateProps): React.ReactNode => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <Icon className="size-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  )
}
