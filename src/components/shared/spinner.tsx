/**
 * @file spinner.tsx
 * @module components/shared/spinner
 * Centered loading spinner using Loader2 icon.
 */

import { Loader } from 'lucide-react'

import { cn } from '@/lib/utils'

interface SpinnerProps {
  className?: string
}

export const Spinner = ({ className }: SpinnerProps): React.ReactNode => (
  <div className={cn('flex items-center justify-center py-8', className)}>
    <Loader className="size-5 animate-spin text-muted-foreground" />
  </div>
)
