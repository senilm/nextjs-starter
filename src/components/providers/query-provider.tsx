/**
 * @file query-provider.tsx
 * @module components/providers/query-provider
 * TanStack Query provider with default staleTime of 60 seconds.
 */

'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

interface QueryProviderProps {
  children: React.ReactNode
}

const STALE_TIME_MS = 60 * 1000

export const QueryProvider = ({ children }: QueryProviderProps): React.ReactNode => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: STALE_TIME_MS,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
