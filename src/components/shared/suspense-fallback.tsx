/**
 * @file suspense-fallback.tsx
 * @module components/shared/suspense-fallback
 * Reusable Suspense wrapper with a centered spinner fallback.
 */

import { Suspense } from 'react'

import { LoadingSpinner } from '@/components/shared/loading-spinner'

interface SuspenseFallbackProps {
  children: React.ReactNode
  className?: string
}

export const SuspenseFallback = ({ children, className }: SuspenseFallbackProps): React.ReactNode => (
  <Suspense fallback={<LoadingSpinner className={className} />}>{children}</Suspense>
)
