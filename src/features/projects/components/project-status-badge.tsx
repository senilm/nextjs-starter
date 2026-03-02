/**
 * @file project-status-badge.tsx
 * @module features/projects/components/project-status-badge
 * Badge variant per project status.
 */

import { Badge } from '@/components/ui/badge'
import type { ProjectStatus } from '@/features/projects/types'

const STATUS_CONFIG: Record<ProjectStatus, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  active: { label: 'Active', variant: 'default' },
  paused: { label: 'Paused', variant: 'secondary' },
  archived: { label: 'Archived', variant: 'outline' },
}

interface ProjectStatusBadgeProps {
  status: ProjectStatus
}

export const ProjectStatusBadge = ({ status }: ProjectStatusBadgeProps): React.ReactNode => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.active

  return <Badge variant={config.variant}>{config.label}</Badge>
}
