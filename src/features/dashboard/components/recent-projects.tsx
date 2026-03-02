/**
 * @file recent-projects.tsx
 * @module features/dashboard/components/recent-projects
 * Last 5 projects list for the dashboard home page.
 */

'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { FolderKanban, ArrowRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { useRecentProjects } from '@/features/dashboard/hooks'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  active: 'default',
  paused: 'secondary',
  archived: 'outline',
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
            <Link href="/dashboard/projects">
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
                  <Link href="/dashboard/projects">Create project</Link>
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{project.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[project.status] ?? 'outline'}>{project.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
