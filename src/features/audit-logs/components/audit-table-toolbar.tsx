/**
 * @file audit-table-toolbar.tsx
 * @module features/audit-logs/components/audit-table-toolbar
 * Toolbar with search, filters, and export for audit log table.
 */

'use client'

import { useMemo } from 'react'

import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { DataTableFilter, type FilterField } from '@/components/data-table/data-table-filter'
import { DataTableExport } from '@/components/data-table/data-table-export'
import { Module, Action, AuditAction, perm } from '@/lib/constants'
import { capitalize, humanize } from '@/lib/format'
import { useSession } from '@/lib/auth-client'

interface AuditTableToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  filters: Record<string, string>
  onFilterChange: (key: string, value: string) => void
  onFilterClear: () => void
  activeFilterCount: number
  onExportCSV: () => void
  onExportXLSX: () => void
  onRefresh?: () => void
  isRefreshing?: boolean
  columnCustomizer?: React.ReactNode
}

export const AuditTableToolbar = ({
  search,
  onSearchChange,
  filters,
  onFilterChange,
  onFilterClear,
  activeFilterCount,
  onExportCSV,
  onExportXLSX,
  onRefresh,
  isRefreshing,
  columnCustomizer,
}: AuditTableToolbarProps): React.ReactNode => {
  const { data: session } = useSession()
  const permissions = session?.user?.permissions ?? []

  const filterFields: FilterField[] = useMemo(() => {
    const allowedModules = Object.values(Module).filter((mod) =>
      permissions.includes(perm(mod, Action.View)),
    )

    return [
      {
        key: 'module',
        label: 'Module',
        type: 'select' as const,
        placeholder: 'All modules',
        options: allowedModules.map((value) => ({
          label: capitalize(value),
          value,
        })),
      },
      {
        key: 'action',
        label: 'Action',
        type: 'select' as const,
        placeholder: 'All actions',
        options: Object.values(AuditAction).map((value) => ({
          label: humanize(value),
          value,
        })),
      },
      {
        key: 'date',
        label: 'Date Range',
        type: 'dateRange' as const,
        fromKey: 'fromDate',
        toKey: 'toDate',
      },
    ]
  }, [permissions])

  return (
    <DataTableToolbar
      searchValue={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by user name or email..."
      onRefresh={onRefresh}
      isRefreshing={isRefreshing}
      columnCustomizer={columnCustomizer}
    >
      <DataTableFilter
        fields={filterFields}
        values={filters}
        onChange={onFilterChange}
        onClear={onFilterClear}
        activeCount={activeFilterCount}
      />
      <DataTableExport onExportCSV={onExportCSV} onExportXLSX={onExportXLSX} />
    </DataTableToolbar>
  )
}
