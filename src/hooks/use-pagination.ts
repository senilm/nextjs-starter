/**
 * @file use-pagination.ts
 * @module hooks/use-pagination
 * Pagination state hook for server-side paginated tables.
 */

import { useState, useCallback } from 'react'

type PaginationState = {
  page: number
  limit: number
}

type UsePaginationReturn = {
  page: number
  limit: number
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  resetPage: () => void
}

export const usePagination = (initialLimit = 10): UsePaginationReturn => {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: initialLimit,
  })

  const setPage = useCallback((page: number): void => {
    setPagination((prev) => ({ ...prev, page }))
  }, [])

  const setLimit = useCallback((limit: number): void => {
    setPagination({ page: 1, limit })
  }, [])

  const resetPage = useCallback((): void => {
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [])

  return {
    ...pagination,
    setPage,
    setLimit,
    resetPage,
  }
}
