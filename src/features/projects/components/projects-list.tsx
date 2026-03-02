/**
 * @file projects-list.tsx
 * @module features/projects/components/projects-list
 * Projects table with search, status filter, and pagination.
 */

'use client'

import { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table'
import { FolderKanban, Search, ChevronLeft, ChevronRight } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { TableSkeleton } from '@/components/shared/loading-skeleton'
import { useDebounce } from '@/hooks/use-debounce'
import { useProjects } from '@/features/projects/hooks'
import { getProjectColumns } from '@/features/projects/components/project-columns'
import { CreateProjectDialog } from '@/features/projects/components/create-project-dialog'
import { EditProjectDialog } from '@/features/projects/components/edit-project-dialog'
import { DeleteProjectDialog } from '@/features/projects/components/delete-project-dialog'
import { PROJECT_STATUSES, type Project, type ProjectStatus } from '@/features/projects/types'

const DEFAULT_LIMIT = 10

/* eslint-disable react-hooks/incompatible-library */
export const ProjectsList = (): React.ReactNode => {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ProjectStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [deleteProject, setDeleteProject] = useState<Project | null>(null)

  const debouncedSearch = useDebounce(search)

  const { data, isLoading } = useProjects({
    search: debouncedSearch || undefined,
    status: status === 'all' ? undefined : status,
    page,
    limit: DEFAULT_LIMIT,
  })

  const columns = useMemo(
    () =>
      getProjectColumns({
        onEdit: (project) => setEditProject(project),
        onDelete: (project) => setDeleteProject(project),
      }),
    [],
  )

  const table = useReactTable({
    data: data?.projects ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages ?? 0,
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage your projects and track their progress."
        actions={<CreateProjectDialog />}
      />

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value as ProjectStatus | 'all')
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {PROJECT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : !data?.projects.length ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description={search ? 'Try adjusting your search or filters.' : 'Create your first project to get started.'}
          action={!search ? <CreateProjectDialog /> : undefined}
        />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * DEFAULT_LIMIT + 1}–{Math.min(page * DEFAULT_LIMIT, data.total)} of {data.total}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <EditProjectDialog project={editProject} open={!!editProject} onOpenChange={(open) => !open && setEditProject(null)} />
      <DeleteProjectDialog project={deleteProject} open={!!deleteProject} onOpenChange={(open) => !open && setDeleteProject(null)} />
    </div>
  )
}
