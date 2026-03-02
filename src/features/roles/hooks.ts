/**
 * @file hooks.ts
 * @module features/roles/hooks
 * TanStack Query hooks for role CRUD operations.
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  getRoles,
  getRole,
  getAllPermissions,
  createRole,
  updateRole,
  deleteRole,
} from '@/features/roles/actions'
import type { RoleWithPermissions, PermissionGroup, ActionResult } from '@/features/roles/types'
import type { CreateRoleInput, UpdateRoleInput } from '@/features/roles/validations'

const ROLES_KEY = ['roles'] as const

export function useRoles(): ReturnType<typeof useQuery<RoleWithPermissions[]>> {
  return useQuery({
    queryKey: ROLES_KEY,
    queryFn: () => getRoles(),
  })
}

export function useRole(roleId: string | null): ReturnType<typeof useQuery<RoleWithPermissions | null>> {
  return useQuery({
    queryKey: [...ROLES_KEY, roleId],
    queryFn: () => (roleId ? getRole(roleId) : null),
    enabled: !!roleId,
  })
}

export function useAllPermissions(): ReturnType<typeof useQuery<PermissionGroup[]>> {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: () => getAllPermissions(),
  })
}

export function useCreateRole(): ReturnType<
  typeof useMutation<ActionResult<RoleWithPermissions>, Error, CreateRoleInput>
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateRoleInput) => createRole(input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Role created')
        void queryClient.invalidateQueries({ queryKey: ROLES_KEY })
      } else {
        toast.error(result.error ?? 'Failed to create role')
      }
    },
    onError: () => toast.error('Failed to create role'),
  })
}

export function useUpdateRole(): ReturnType<typeof useMutation<ActionResult, Error, UpdateRoleInput>> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateRoleInput) => updateRole(input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Role updated')
        void queryClient.invalidateQueries({ queryKey: ROLES_KEY })
      } else {
        toast.error(result.error ?? 'Failed to update role')
      }
    },
    onError: () => toast.error('Failed to update role'),
  })
}

export function useDeleteRole(): ReturnType<typeof useMutation<ActionResult, Error, string>> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (roleId: string) => deleteRole(roleId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Role deleted')
        void queryClient.invalidateQueries({ queryKey: ROLES_KEY })
      } else {
        toast.error(result.error ?? 'Failed to delete role')
      }
    },
    onError: () => toast.error('Failed to delete role'),
  })
}
