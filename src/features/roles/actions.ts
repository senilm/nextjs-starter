/**
 * @file actions.ts
 * @module features/roles/actions
 * Server actions for role CRUD and permission management.
 */

'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission, invalidateUserSessions } from '@/lib/rbac'
import { createRoleSchema, updateRoleSchema } from '@/features/roles/validations'
import type { RoleWithPermissions, PermissionGroup, ActionResult } from '@/features/roles/types'

async function requirePermission(permissionKey: string): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  const allowed = await hasPermission(session.user.id, permissionKey)
  if (!allowed) throw new Error('Permission denied')
  return session.user.id
}

export async function getRoles(): Promise<RoleWithPermissions[]> {
  await requirePermission('roles.view')

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
    isDefault: role.isDefault,
    userCount: role._count.users,
    permissionKeys: role.rolePermissions.map((rp) => rp.permission.key),
    createdAt: role.createdAt,
  }))
}

export async function getRole(roleId: string): Promise<RoleWithPermissions | null> {
  await requirePermission('roles.view')

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
    isDefault: role.isDefault,
    userCount: role._count.users,
    permissionKeys: role.rolePermissions.map((rp) => rp.permission.key),
    createdAt: role.createdAt,
  }
}

export async function getAllPermissions(): Promise<PermissionGroup[]> {
  await requirePermission('roles.view')

  const permissions = await prisma.permission.findMany({
    orderBy: [{ module: 'asc' }, { action: 'asc' }],
  })

  const grouped = new Map<string, PermissionGroup>()

  for (const perm of permissions) {
    if (!grouped.has(perm.module)) {
      grouped.set(perm.module, { module: perm.module, permissions: [] })
    }
    grouped.get(perm.module)!.permissions.push({
      id: perm.id,
      key: perm.key,
      action: perm.action,
      description: perm.description,
    })
  }

  return Array.from(grouped.values())
}

export async function createRole(input: unknown): Promise<ActionResult<RoleWithPermissions>> {
  await requirePermission('roles.create')

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
        create: parsed.data.permissionIds.map((permissionId) => ({ permissionId })),
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
      isDefault: role.isDefault,
      userCount: role._count.users,
      permissionKeys: role.rolePermissions.map((rp) => rp.permission.key),
      createdAt: role.createdAt,
    },
  }
}

export async function updateRole(input: unknown): Promise<ActionResult> {
  await requirePermission('roles.edit')

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
      data: parsed.data.permissionIds.map((permissionId) => ({
        roleId: parsed.data.id,
        permissionId,
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
  await requirePermission('roles.delete')

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
