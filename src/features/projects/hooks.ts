/**
 * @file hooks.ts
 * @module features/projects/hooks
 * TanStack Query hooks for project CRUD with optimistic updates.
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from '@/features/projects/actions'
import type {
  ProjectFilters,
  ProjectsResponse,
  Project,
  ActionResult,
} from '@/features/projects/types'
import type { CreateProjectInput, UpdateProjectInput } from '@/features/projects/validations'

const PROJECTS_KEY = ['projects'] as const

export function useProjects(
  filters: ProjectFilters,
): ReturnType<typeof useQuery<ProjectsResponse>> {
  return useQuery({
    queryKey: [...PROJECTS_KEY, filters],
    queryFn: () => getProjects(filters),
  })
}

export function useCreateProject(): ReturnType<typeof useMutation<ActionResult<Project>, Error, CreateProjectInput>> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateProjectInput) => createProject(input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Project created')
        void queryClient.invalidateQueries({ queryKey: PROJECTS_KEY })
        void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      } else {
        toast.error(result.error ?? 'Failed to create project')
      }
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: PROJECTS_KEY })
      toast.error('Failed to create project')
    },
  })
}

export function useUpdateProject(): ReturnType<typeof useMutation<ActionResult<Project>, Error, UpdateProjectInput>> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateProjectInput) => updateProject(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: PROJECTS_KEY })

      const previousData = queryClient.getQueriesData<ProjectsResponse>({ queryKey: PROJECTS_KEY })

      queryClient.setQueriesData<ProjectsResponse>({ queryKey: PROJECTS_KEY }, (old) => {
        if (!old) return old
        return {
          ...old,
          projects: old.projects.map((p) =>
            p.id === input.id ? { ...p, ...input, updatedAt: new Date() } : p,
          ),
        }
      })

      return { previousData }
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Project updated')
      } else {
        toast.error(result.error ?? 'Failed to update project')
      }
      void queryClient.invalidateQueries({ queryKey: PROJECTS_KEY })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (_err, _input, context) => {
      if (context?.previousData) {
        for (const [key, data] of context.previousData) {
          queryClient.setQueryData(key, data)
        }
      }
      toast.error('Failed to update project')
    },
  })
}

export function useDeleteProject(): ReturnType<typeof useMutation<ActionResult, Error, string>> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (projectId: string) => deleteProject(projectId),
    onMutate: async (projectId) => {
      await queryClient.cancelQueries({ queryKey: PROJECTS_KEY })

      const previousData = queryClient.getQueriesData<ProjectsResponse>({ queryKey: PROJECTS_KEY })

      queryClient.setQueriesData<ProjectsResponse>({ queryKey: PROJECTS_KEY }, (old) => {
        if (!old) return old
        return {
          ...old,
          projects: old.projects.filter((p) => p.id !== projectId),
          total: old.total - 1,
        }
      })

      return { previousData }
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Project deleted')
      } else {
        toast.error(result.error ?? 'Failed to delete project')
      }
      void queryClient.invalidateQueries({ queryKey: PROJECTS_KEY })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (_err, _input, context) => {
      if (context?.previousData) {
        for (const [key, data] of context.previousData) {
          queryClient.setQueryData(key, data)
        }
      }
      toast.error('Failed to delete project')
    },
  })
}
