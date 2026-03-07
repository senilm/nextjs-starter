/**
 * @file loading-spinner.tsx
 * @module components/shared/loading-spinner
 * Centered loading spinner with size variants.
 */

import { Loader } from 'lucide-react'

import { cn } from '@/lib/utils'

const SPINNER_SIZES = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-8',
} as const

type SpinnerSize = keyof typeof SPINNER_SIZES

interface LoadingSpinnerProps {
  size?: SpinnerSize
  className?: string
}

export const LoadingSpinner = ({
  size = 'md',
  className,
}: LoadingSpinnerProps): React.ReactNode => (
  <div className={cn('flex items-center justify-center py-8', className)}>
    <Loader className={cn(SPINNER_SIZES[size], 'animate-spin text-primary')} />
  </div>
)
