/**
 * @file query-provider.tsx
 * @module components/providers/query-provider
 * TanStack Query provider with global auth error handling.
 */

'use client'

import { useState } from 'react'
import { QueryCache, MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { handleAuthError, isAuthError } from '@/lib/query-auth-handler'

interface QueryProviderProps {
  children: React.ReactNode
}

const STALE_TIME_MS = 60 * 1000

export const QueryProvider = ({ children }: QueryProviderProps): React.ReactNode => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({ onError: handleAuthError }),
        mutationCache: new MutationCache({ onError: handleAuthError }),
        defaultOptions: {
          queries: {
            staleTime: STALE_TIME_MS,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              if (isAuthError(error)) return false
              return failureCount < 3
            },
          },
        },
      }),
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
