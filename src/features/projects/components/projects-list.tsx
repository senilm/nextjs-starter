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
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { useDebounce } from '@/hooks/use-debounce'
import { usePagination } from '@/hooks/use-pagination'
import { useProjects } from '@/features/projects/hooks'
import { getProjectColumns } from '@/features/projects/components/project-columns'
import { CreateProjectDialog } from '@/features/projects/components/create-project-dialog'
import { EditProjectDialog } from '@/features/projects/components/edit-project-dialog'
import { DeleteProjectDialog } from '@/features/projects/components/delete-project-dialog'
import { PROJECT_STATUSES, type Project, type ProjectStatus } from '@/features/projects/types'

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
  const [search, setSearch] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [deleteProject, setDeleteProject] = useState<Project | null>(null)
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
        onEdit: (project) => setEditProject(project),
        onDelete: (project) => setDeleteProject(project),
      }),
    [],
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

  if (!isLoading && !data?.projects.length && !hasActiveFilters) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Projects"
          description="Manage your projects and track their progress."
          actions={<CreateProjectDialog />}
        />
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description="Create your first project to get started."
          action={<CreateProjectDialog />}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage your projects and track their progress."
        actions={<CreateProjectDialog />}
      />

      <DataTable
        columns={columns}
        data={data?.projects ?? []}
        isLoading={isLoading}
        hasActiveFilters={hasActiveFilters}
        emptyTitle="No projects found"
        emptyDescription="Create your first project to get started."
        pagination={data ? { page: data.page, limit, total: data.total, totalPages: data.totalPages } : undefined}
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

      <EditProjectDialog project={editProject} open={!!editProject} onOpenChange={(open) => !open && setEditProject(null)} />
      <DeleteProjectDialog project={deleteProject} open={!!deleteProject} onOpenChange={(open) => !open && setDeleteProject(null)} />
    </div>
  )
}
