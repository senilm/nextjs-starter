/**
 * @file audit-management.tsx
 * @module features/audit-logs/components/audit-management
 * Admin audit log viewer — table, filters, export, and detail sheet.
 */

'use client'

import { useState, useMemo, useCallback } from 'react'
import { ScrollText } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { DataTable } from '@/components/data-table/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { useDebounce } from '@/hooks/use-debounce'
import { usePagination } from '@/hooks/use-pagination'
import { exportToCSV, exportToXLSX } from '@/lib/export'
import { formatDateTime, capitalize } from '@/lib/format'
import { getAuditLogs } from '@/features/audit-logs/actions'
import { auditColumns } from '@/features/audit-logs/components/audit-columns'
import { AuditTableToolbar } from '@/features/audit-logs/components/audit-table-toolbar'
import { AuditDetailSheet } from '@/features/audit-logs/components/audit-detail-sheet'
import type { AuditLogFilters, AuditLogEntry } from '@/features/audit-logs/types'

export const AuditManagement = (): React.ReactNode => {
  const { page, limit, setPage, setLimit, resetPage } = usePagination()
  const [search, setSearch] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const debouncedSearch = useDebounce(search)

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filterValues.module) count++
    if (filterValues.action) count++
    if (filterValues.fromDate || filterValues.toDate) count++
    return count
  }, [filterValues])

  const hasActiveFilters = !!debouncedSearch || activeFilterCount > 0

  const filters: AuditLogFilters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      module: filterValues.module || undefined,
      action: filterValues.action || undefined,
      fromDate: filterValues.fromDate || undefined,
      toDate: filterValues.toDate || undefined,
      page,
      limit,
    }),
    [debouncedSearch, filterValues, page, limit],
  )

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => getAuditLogs(filters),
  })

  const handleRowClick = useCallback((audit: AuditLogEntry): void => {
    setSelectedAuditId(audit.id)
    setDetailOpen(true)
  }, [])

  const handleSearchChange = (value: string): void => {
    setSearch(value)
    resetPage()
  }

  const handleFilterChange = (key: string, value: string): void => {
    setFilterValues((prev) => ({ ...prev, [key]: value }))
    resetPage()
  }

  const handleFilterClear = (): void => {
    setFilterValues({})
    resetPage()
  }

  const prepareExportData = (): Record<string, unknown>[] => {
    if (!data?.logs) return []
    return data.logs.map((log) => ({
      'User Name': log.userName,
      'Email': log.userEmail,
      'Role': log.userRole ?? '-',
      'Module': capitalize(log.module),
      'Action': capitalize(log.action),
      'Record ID': log.recordId ?? '-',
      'IP Address': log.ipAddress ?? '-',
      'Date': formatDateTime(log.createdAt),
    }))
  }

  if (!isLoading && !data?.logs.length && !hasActiveFilters) {
    return (
      <div className="space-y-6">
        <PageHeader title="Audit Logs" description="Track all system activity and changes." />
        <EmptyState
          icon={ScrollText}
          title="No audit logs yet"
          description="Audit logs will appear here as users perform actions."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" description="Track all system activity and changes." />

      <DataTable
        columns={auditColumns}
        data={data?.logs ?? []}
        onRowClick={handleRowClick}
        isLoading={isLoading}
        hasActiveFilters={hasActiveFilters}
        emptyTitle="No audit logs found"
        emptyDescription="Try adjusting your search or filters."
        pagination={
          data
            ? { page: data.page, limit, total: data.total, totalPages: data.totalPages }
            : undefined
        }
        onPageChange={setPage}
        onLimitChange={setLimit}
        toolbar={(columnCustomizer) => (
          <AuditTableToolbar
            search={search}
            onSearchChange={handleSearchChange}
            filters={filterValues}
            onFilterChange={handleFilterChange}
            onFilterClear={handleFilterClear}
            activeFilterCount={activeFilterCount}
            onExportCSV={() => exportToCSV(prepareExportData(), 'audit-logs')}
            onExportXLSX={() => exportToXLSX(prepareExportData(), 'audit-logs')}
            onRefresh={() => void refetch()}
            isRefreshing={isRefetching}
            columnCustomizer={columnCustomizer}
          />
        )}
      />

      <AuditDetailSheet
        auditId={selectedAuditId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}
