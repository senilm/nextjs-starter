/**
 * @file use-sorting.ts
 * @module hooks/use-sorting
 * Sorting state hook that maps TanStack sorting to API query params.
 */

import { useState } from 'react'
import type { SortingState } from '@tanstack/react-table'

const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
} as const

type SortOrder = (typeof SORT_ORDER)[keyof typeof SORT_ORDER]

type UseSortingReturn = {
  sorting: SortingState
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>
  sortBy: string | undefined
  sortOrder: SortOrder | undefined
}

export const useSorting = (): UseSortingReturn => {
  const [sorting, setSorting] = useState<SortingState>([])

  const sortBy = sorting[0]?.id
  const sortOrder = sorting[0]
    ? sorting[0].desc
      ? SORT_ORDER.DESC
      : SORT_ORDER.ASC
    : undefined

  return { sorting, setSorting, sortBy, sortOrder }
}
