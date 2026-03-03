/**
 * @file recent-projects.tsx
 * @module features/dashboard/components/recent-projects
 * Last 5 projects list with clickable rows, status dots, and hover states.
 */

'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { FolderKanban, ArrowRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { cn } from '@/lib/utils'
import { paths } from '@/lib/paths'
import { useRecentProjects } from '@/features/dashboard/hooks'

const STATUS_DOT_COLOR: Record<string, string> = {
  active: 'bg-emerald-500',
  paused: 'bg-amber-500',
  archived: 'bg-gray-400',
}

export const RecentProjects = (): React.ReactNode => {
  const { data: projects, isLoading } = useRecentProjects()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut', delay: 0.1 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Projects</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href={paths.dashboard.projects.list()}>
              View all
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          ) : !projects?.length ? (
            <EmptyState
              icon={FolderKanban}
              title="No projects yet"
              description="Create your first project to get started."
              action={
                <Button asChild size="sm">
                  <Link href={paths.dashboard.projects.list()}>Create project</Link>
                </Button>
              }
            />
          ) : (
            <div className="space-y-1">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={paths.dashboard.projects.detail(project.id)}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'size-2.5 shrink-0 rounded-full',
                        STATUS_DOT_COLOR[project.status] ?? 'bg-gray-400',
                      )}
                    />
                    <div>
                      <p className="text-sm font-medium">{project.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs capitalize text-muted-foreground">{project.status}</span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
