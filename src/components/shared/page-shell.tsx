/**
 * @file page-shell.tsx
 * @module components/shared/page-shell
 * Common page layout with fixed header and flex-grow content area.
 */

import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/shared/page-header'

interface PageShellProps {
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export const PageShell = ({
  title,
  description,
  actions,
  children,
  className,
}: PageShellProps): React.ReactNode => {
  return (
    <div className={cn('flex h-full flex-col gap-6', className)}>
      <PageHeader title={title} description={description} actions={actions} />
      <div className="flex-1">{children}</div>
    </div>
  )
}
