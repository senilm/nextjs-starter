/**
 * @file data-table.tsx
 * @module components/data-table/data-table
 * Generic reusable DataTable with sorting, row selection, column visibility, and pagination.
 */

'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type RowSelectionState,
  type VisibilityState,
  type OnChangeFn,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from '@/components/data-table/data-table-pagination'
import { DataTableColumnCustomizer } from '@/components/data-table/data-table-column-customizer'
import { EmptyState } from '@/components/shared/empty-state'
import { TableSkeleton, GridCardSkeleton } from '@/components/shared/loading-skeleton'
import { LoadingTransition } from '@/components/shared/loading-transition'
import { type ViewMode } from '@/types/data-table'

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  getRowId?: (row: TData) => string
  pagination?: PaginationData
  onPageChange?: (page: number) => void
  onLimitChange?: (limit: number) => void
  isLoading?: boolean
  toolbar?: ReactNode | ((columnCustomizer: ReactNode) => ReactNode)
  bulkActions?: ReactNode
  rowSelection?: RowSelectionState
  onRowSelectionChange?: (selection: RowSelectionState) => void
  columnVisibility?: VisibilityState
  onColumnVisibilityChange?: (visibility: VisibilityState) => void
  onRowClick?: (row: TData) => void
  emptyTitle?: string
  emptyDescription?: string
  hasActiveFilters?: boolean
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  viewMode?: ViewMode
  renderCard?: (row: TData) => ReactNode
}

export const DataTable = <TData, TValue>({
  columns,
  data,
  getRowId,
  pagination,
  onPageChange,
  onLimitChange,
  isLoading,
  toolbar,
  bulkActions,
  rowSelection: controlledRowSelection,
  onRowSelectionChange,
  columnVisibility: controlledColumnVisibility,
  onColumnVisibilityChange,
  onRowClick,
  emptyTitle,
  emptyDescription,
  hasActiveFilters,
  sorting: controlledSorting,
  onSortingChange,
  viewMode,
  renderCard,
}: DataTableProps<TData, TValue>): React.ReactNode => {
  const [internalSorting, setInternalSorting] = useState<SortingState>([])
  const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({})
  const [internalColumnVisibility, setInternalColumnVisibility] = useState<VisibilityState>({})

  const isServerSideSort = !!onSortingChange
  const sorting = controlledSorting ?? internalSorting
  const rowSelection = controlledRowSelection ?? internalRowSelection
  const columnVisibility = controlledColumnVisibility ?? internalColumnVisibility

  const table = useReactTable({
    data,
    columns,
    ...(getRowId && { getRowId }),
    getCoreRowModel: getCoreRowModel(),
    ...(isServerSideSort ? { manualSorting: true } : { getSortedRowModel: getSortedRowModel() }),
    onSortingChange: onSortingChange ?? setInternalSorting,
    onRowSelectionChange: onRowSelectionChange
      ? (updater) => {
          const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater
          onRowSelectionChange(newSelection)
        }
      : setInternalRowSelection,
    onColumnVisibilityChange: onColumnVisibilityChange
      ? (updater) => {
          const newVisibility =
            typeof updater === 'function' ? updater(columnVisibility) : updater
          onColumnVisibilityChange(newVisibility)
        }
      : setInternalColumnVisibility,
    state: {
      sorting,
      rowSelection,
      columnVisibility,
    },
    manualPagination: true,
  })

  const selectedCount = Object.keys(rowSelection).length
  const isGridMode = viewMode === 'grid' && renderCard

  const columnCustomizer = isGridMode ? null : <DataTableColumnCustomizer table={table} />

  const emptyContent = hasActiveFilters ? (
    <EmptyState
      title="No results found"
      description="Try adjusting your search or filters."
    />
  ) : (
    <EmptyState
      title={emptyTitle ?? 'No data'}
      description={emptyDescription ?? 'No records to display.'}
    />
  )

  return (
    <div>
      {typeof toolbar === 'function' ? toolbar(columnCustomizer) : toolbar}

      {!isGridMode && selectedCount > 0 && bulkActions}

      {isGridMode ? (
        <LoadingTransition
          isLoading={!!isLoading}
          loader={
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <GridCardSkeleton key={`grid-skeleton-${i}`} />
              ))}
            </div>
          }
        >
          {data.length === 0 ? (
            emptyContent
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.map((row, index) => renderCard(row))}
            </div>
          )}
        </LoadingTransition>
      ) : (
        <div className="rounded-md border">
          <LoadingTransition isLoading={!!isLoading} loader={<div className="p-4"><TableSkeleton /></div>}>
            {data.length === 0 ? (
              emptyContent
            ) : (
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className={onRowClick ? 'cursor-pointer focus-visible:bg-muted/50 focus-visible:outline-none' : undefined}
                      tabIndex={onRowClick ? 0 : undefined}
                      role={onRowClick ? 'button' : undefined}
                      onClick={onRowClick ? (e) => {
                        const target = e.target as HTMLElement
                        if (target.closest('button, a, input, [role="menuitem"], [role="checkbox"], [data-radix-collection-item]')) return
                        onRowClick(row.original)
                      } : undefined}
                      onKeyDown={onRowClick ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onRowClick(row.original)
                        }
                      } : undefined}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </LoadingTransition>
        </div>
      )}

      {pagination && onPageChange && onLimitChange && (
        <DataTablePagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          selectedCount={isGridMode ? 0 : selectedCount}
        />
      )}
    </div>
  )
}
