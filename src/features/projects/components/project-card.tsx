/**
 * @file project-card.tsx
 * @module features/projects/components/project-card
 * Card component for the projects grid view.
 */

'use client'

import { motion } from 'motion/react'
import { Calendar } from 'lucide-react'

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from '@/components/ui/card'
import { DataTableRowActions } from '@/components/data-table/data-table-row-actions'
import { ProjectStatusBadge } from '@/features/projects/components/project-status-badge'
import { formatDate } from '@/lib/format'
import type { Project } from '@/features/projects/types'

const DESCRIPTION_MAX_LENGTH = 100

interface ProjectCardProps {
  project: Project
  index: number
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

export const ProjectCard = ({
  project,
  index,
  onEdit,
  onDelete,
}: ProjectCardProps): React.ReactNode => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut', delay: index * 0.05 }}
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="truncate">{project.name}</CardTitle>
          <CardDescription className="line-clamp-2 min-h-10">
            {project.description
              ? project.description.length > DESCRIPTION_MAX_LENGTH
                ? `${project.description.slice(0, DESCRIPTION_MAX_LENGTH)}...`
                : project.description
              : 'No description'}
          </CardDescription>
          <CardAction>
            <DataTableRowActions
              onEdit={() => onEdit(project)}
              onDelete={() => onDelete(project)}
            />
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <ProjectStatusBadge status={project.status} />
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <Calendar className="size-3" />
              {formatDate(project.createdAt)}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
