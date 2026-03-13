/**
 * @file projects-list.tsx
 * @module features/projects/components/projects-list
 * Projects table with search, status filter, and pagination.
 */

'use client'

import { useState, useMemo } from 'react'
import { FolderKanban } from 'lucide-react'

import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { DataTableFilter, type FilterField } from '@/components/data-table/data-table-filter'
import { PageShell } from '@/components/shared/page-shell'
import { EmptyState } from '@/components/shared/empty-state'
import { ViewToggle } from '@/components/shared/view-toggle'
import { CreateProjectButton } from '@/features/projects/components/create-project-button'
import { ProjectCard } from '@/features/projects/components/project-card'
import { useDebounce } from '@/hooks/use-debounce'
import { usePagination } from '@/hooks/use-pagination'
import { useDialogStore, DIALOG_KEY } from '@/stores/dialog-store'
import { useProjects } from '@/features/projects/hooks'
import { getProjectColumns } from '@/features/projects/components/project-columns'
import { PROJECT_STATUSES, type ProjectStatus } from '@/features/projects/types'
import { VIEW_MODE, type ViewMode } from '@/types/data-table'

const STATUS_FILTER_OPTIONS = PROJECT_STATUSES.map((s) => ({
  label: s.charAt(0).toUpperCase() + s.slice(1),
  value: s,
}))

const FILTER_FIELDS: FilterField[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    placeholder: 'All statuses',
    options: STATUS_FILTER_OPTIONS,
  },
]

export const ProjectsList = (): React.ReactNode => {
  const { openDialog } = useDialogStore()
  const [viewMode, setViewMode] = useState<ViewMode>(VIEW_MODE.LIST)
  const [search, setSearch] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})
  const { page, limit, setPage, setLimit, resetPage } = usePagination()

  const debouncedSearch = useDebounce(search)

  const statusFilter = (filterValues.status as ProjectStatus) || undefined
  const activeFilterCount = Object.values(filterValues).filter(Boolean).length

  const { data, isLoading, refetch, isRefetching } = useProjects({
    search: debouncedSearch || undefined,
    status: statusFilter,
    page,
    limit,
  })

  const columns = useMemo(
    () =>
      getProjectColumns({
        onEdit: (project) => openDialog(DIALOG_KEY.EDIT_PROJECT, project),
        onDelete: (project) => openDialog(DIALOG_KEY.DELETE_PROJECT, { id: project.id, name: project.name }),
      }),
    [openDialog],
  )

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

  const hasActiveFilters = !!debouncedSearch || activeFilterCount > 0
  const isEmpty = !isLoading && !data?.projects.length && !hasActiveFilters

  return (
    <PageShell
      title="Projects"
      description="Manage your projects and track their progress."
      actions={<CreateProjectButton />}
    >
      {isEmpty ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description="Create your first project to get started."
          action={<CreateProjectButton />}
        />
      ) : (
        <DataTable
          columns={columns}
          data={data?.projects ?? []}
          isLoading={isLoading}
          hasActiveFilters={hasActiveFilters}
          emptyTitle="No projects found"
          emptyDescription="Create your first project to get started."
          viewMode={viewMode}
          renderCard={(project) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={data?.projects.indexOf(project) ?? 0}
              onEdit={(p) => openDialog(DIALOG_KEY.EDIT_PROJECT, p)}
              onDelete={(p) => openDialog(DIALOG_KEY.DELETE_PROJECT, { id: p.id, name: p.name })}
            />
          )}
          pagination={
            data
              ? { page: data.page, limit, total: data.total, totalPages: data.totalPages }
              : undefined
          }
          onPageChange={setPage}
          onLimitChange={setLimit}
          toolbar={(columnCustomizer) => (
            <DataTableToolbar
              searchValue={search}
              onSearchChange={handleSearchChange}
              searchPlaceholder="Search projects..."
              onRefresh={() => void refetch()}
              isRefreshing={isRefetching}
              columnCustomizer={columnCustomizer}
            >
              <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
              <DataTableFilter
                fields={FILTER_FIELDS}
                values={filterValues}
                onChange={handleFilterChange}
                onClear={handleFilterClear}
                activeCount={activeFilterCount}
              />
            </DataTableToolbar>
          )}
        />
      )}
    </PageShell>
  )
}
