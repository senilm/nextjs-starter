/**
 * @file actions.ts
 * @module features/roles/actions
 * Server actions for role CRUD and permission management.
 */

'use server'

import { revalidatePath } from 'next/cache'

import { requirePermission } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { invalidateUserSessions } from '@/lib/rbac'
import { createRoleSchema, updateRoleSchema } from '@/features/roles/validations'
import type { RoleWithPermissions, PermissionGroup, ActionResult } from '@/features/roles/types'

async function requireRolePermission(permissionKey: string): Promise<string> {
  const session = await requirePermission(permissionKey)
  return session.user.id
}

export async function getRoles(): Promise<RoleWithPermissions[]> {
  await requireRolePermission('roles.view')

  const roles = await prisma.role.findMany({
    where: { deletedAt: null },
    include: {
      rolePermissions: { include: { permission: { select: { key: true } } } },
      _count: { select: { users: { where: { deletedAt: null } } } },
    },
    orderBy: { createdAt: 'asc' },
  })

  return roles.map((role) => ({
    id: role.id,
    name: role.name,
    description: role.description,
    isSystem: role.isSystem,
    userCount: role._count.users,
    permissionKeys: role.rolePermissions.map((rp) => rp.permission.key),
    createdAt: role.createdAt,
  }))
}

export async function getRole(roleId: string): Promise<RoleWithPermissions | null> {
  await requireRolePermission('roles.view')

  const role = await prisma.role.findFirst({
    where: { id: roleId, deletedAt: null },
    include: {
      rolePermissions: { include: { permission: { select: { key: true } } } },
      _count: { select: { users: { where: { deletedAt: null } } } },
    },
  })

  if (!role) return null

  return {
    id: role.id,
    name: role.name,
    description: role.description,
    isSystem: role.isSystem,
    userCount: role._count.users,
    permissionKeys: role.rolePermissions.map((rp) => rp.permission.key),
    createdAt: role.createdAt,
  }
}

export async function getAllPermissions(): Promise<PermissionGroup[]> {
  await requireRolePermission('roles.view')

  const permissions = await prisma.permission.findMany({
    orderBy: [{ module: 'asc' }, { action: 'asc' }],
  })

  const grouped = new Map<string, PermissionGroup>()

  for (const perm of permissions) {
    if (!grouped.has(perm.module)) {
      grouped.set(perm.module, { module: perm.module, permissions: [] })
    }
    grouped.get(perm.module)!.permissions.push({
      key: perm.key,
      action: perm.action,
      description: perm.description,
    })
  }

  return Array.from(grouped.values())
}

export async function createRole(input: unknown): Promise<ActionResult<RoleWithPermissions>> {
  await requireRolePermission('roles.create')

  const parsed = createRoleSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' }

  const existing = await prisma.role.findFirst({
    where: { name: parsed.data.name, deletedAt: null },
  })
  if (existing) return { success: false, error: 'A role with this name already exists' }

  const role = await prisma.role.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      rolePermissions: {
        create: parsed.data.permissionKeys.map((permissionKey) => ({ permissionKey })),
      },
    },
    include: {
      rolePermissions: { include: { permission: { select: { key: true } } } },
      _count: { select: { users: { where: { deletedAt: null } } } },
    },
  })

  revalidatePath('/admin/roles')
  return {
    success: true,
    data: {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      userCount: role._count.users,
      permissionKeys: role.rolePermissions.map((rp) => rp.permission.key),
      createdAt: role.createdAt,
    },
  }
}

export async function updateRole(input: unknown): Promise<ActionResult> {
  await requireRolePermission('roles.edit')

  const parsed = updateRoleSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' }

  const existing = await prisma.role.findFirst({
    where: { id: parsed.data.id, deletedAt: null },
  })
  if (!existing) return { success: false, error: 'Role not found' }

  const duplicate = await prisma.role.findFirst({
    where: { name: parsed.data.name, deletedAt: null, id: { not: parsed.data.id } },
  })
  if (duplicate) return { success: false, error: 'A role with this name already exists' }

  await prisma.$transaction(async (tx) => {
    const updateData: { description: string | null; name?: string } = {
      description: parsed.data.description ?? null,
    }
    if (!existing.isSystem) {
      updateData.name = parsed.data.name
    }

    await tx.role.update({ where: { id: parsed.data.id }, data: updateData })

    await tx.rolePermission.deleteMany({ where: { roleId: parsed.data.id } })
    await tx.rolePermission.createMany({
      data: parsed.data.permissionKeys.map((permissionKey) => ({
        roleId: parsed.data.id,
        permissionKey,
      })),
    })
  })

  const affectedUsers = await prisma.user.findMany({
    where: { roleId: parsed.data.id, deletedAt: null },
    select: { id: true },
  })

  await Promise.all(affectedUsers.map((u) => invalidateUserSessions(u.id)))

  revalidatePath('/admin/roles')
  return { success: true }
}

export async function deleteRole(roleId: string): Promise<ActionResult> {
  await requireRolePermission('roles.delete')

  const role = await prisma.role.findFirst({
    where: { id: roleId, deletedAt: null },
    include: { _count: { select: { users: { where: { deletedAt: null } } } } },
  })

  if (!role) return { success: false, error: 'Role not found' }
  if (role.isSystem) return { success: false, error: 'Cannot delete a system role' }
  if (role._count.users > 0) return { success: false, error: 'Cannot delete a role with assigned users' }

  await prisma.role.update({ where: { id: roleId }, data: { deletedAt: new Date() } })

  revalidatePath('/admin/roles')
  return { success: true }
}

export async function bulkDeleteRoles(roleIds: string[]): Promise<ActionResult> {
  await requireRolePermission('roles.delete')

  try {
    await prisma.$transaction(async (tx) => {
      const roles = await tx.role.findMany({
        where: { id: { in: roleIds }, deletedAt: null },
        include: { _count: { select: { users: { where: { deletedAt: null } } } } },
      })

      if (roles.length !== roleIds.length) {
        throw new Error('One or more roles not found')
      }

      const systemRole = roles.find((r) => r.isSystem)
      if (systemRole) {
        throw new Error(`Cannot delete system role "${systemRole.name}"`)
      }

      const roleWithUsers = roles.find((r) => r._count.users > 0)
      if (roleWithUsers) {
        throw new Error(`Role "${roleWithUsers.name}" has assigned users`)
      }

      await tx.role.updateMany({
        where: { id: { in: roleIds }, deletedAt: null },
        data: { deletedAt: new Date() },
      })
    })
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete roles' }
  }

  revalidatePath('/admin/roles')
  return { success: true }
}
