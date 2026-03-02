/**
 * @file page.tsx
 * @module app/(dashboard)/dashboard/projects/page
 * Projects page — thin wrapper around ProjectsList feature component.
 */

import type { Metadata } from 'next'

import { ProjectsList } from '@/features/projects/components/projects-list'

export const metadata: Metadata = {
  title: 'Projects',
}

export default function ProjectsPage(): React.ReactNode {
  return <ProjectsList />
}
