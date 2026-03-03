/**
 * @file suspense-fallback.tsx
 * @module components/shared/suspense-fallback
 * Reusable Suspense wrapper with a centered spinner fallback.
 */

import { Suspense } from 'react'

import { Spinner } from '@/components/shared/spinner'

interface SuspenseFallbackProps {
  children: React.ReactNode
  className?: string
}

export const SuspenseFallback = ({ children, className }: SuspenseFallbackProps): React.ReactNode => (
  <Suspense fallback={<Spinner className={className} />}>{children}</Suspense>
)
