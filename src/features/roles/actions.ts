/**
 * @file actions.ts
 * @module features/roles/actions
 * Server actions for role CRUD and permission management.
 */

'use server'

import { revalidatePath } from 'next/cache'
import { after } from 'next/server'

import { requirePermission } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { invalidateUserSessions } from '@/lib/rbac'
import { logAudit, getClientIp } from '@/lib/audit'
import { Module, AuditAction } from '@/lib/constants'
import { createRoleSchema, updateRoleSchema } from '@/features/roles/validations'
import type { ActionResult } from '@/types/shared'
import type { RoleWithPermissions, PermissionGroup } from '@/features/roles/types'

type RoleSession = Awaited<ReturnType<typeof requirePermission>>

async function requireRolePermission(permissionKey: string): Promise<RoleSession> {
  return requirePermission(permissionKey)
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
  const session = await requireRolePermission('roles.create')

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

  const ip = await getClientIp()
  after(async () => {
    await logAudit({
      module: Module.Roles,
      action: AuditAction.Created,
      recordId: role.id,
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      userRole: session.user.role?.name,
      newValues: { name: parsed.data.name, permissionKeys: parsed.data.permissionKeys },
      ipAddress: ip,
    })
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
  const session = await requireRolePermission('roles.edit')

  const parsed = updateRoleSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' }

  const existing = await prisma.role.findFirst({
    where: { id: parsed.data.id, deletedAt: null },
    include: { rolePermissions: { select: { permissionKey: true } } },
  })
  if (!existing) return { success: false, error: 'Role not found' }

  const duplicate = await prisma.role.findFirst({
    where: { name: parsed.data.name, deletedAt: null, id: { not: parsed.data.id } },
  })
  if (duplicate) return { success: false, error: 'A role with this name already exists' }

  const previousValues = {
    name: existing.name,
    description: existing.description,
    permissionKeys: existing.rolePermissions.map((rp) => rp.permissionKey),
  }

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

  const ip = await getClientIp()
  after(async () => {
    await logAudit({
      module: Module.Roles,
      action: AuditAction.Updated,
      recordId: parsed.data.id,
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      userRole: session.user.role?.name,
      previousValues,
      newValues: { name: parsed.data.name, permissionKeys: parsed.data.permissionKeys },
      ipAddress: ip,
    })
  })

  revalidatePath('/admin/roles')
  return { success: true }
}

export async function deleteRole(roleId: string): Promise<ActionResult> {
  const session = await requireRolePermission('roles.delete')

  const role = await prisma.role.findFirst({
    where: { id: roleId, deletedAt: null },
    include: { _count: { select: { users: { where: { deletedAt: null } } } } },
  })

  if (!role) return { success: false, error: 'Role not found' }
  if (role.isSystem) return { success: false, error: 'Cannot delete a system role' }
  if (role._count.users > 0) return { success: false, error: 'Cannot delete a role with assigned users' }

  await prisma.role.update({ where: { id: roleId }, data: { deletedAt: new Date() } })

  const ip = await getClientIp()
  after(async () => {
    await logAudit({
      module: Module.Roles,
      action: AuditAction.Deleted,
      recordId: roleId,
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      userRole: session.user.role?.name,
      previousValues: { name: role.name, description: role.description },
      ipAddress: ip,
    })
  })

  revalidatePath('/admin/roles')
  return { success: true }
}

export async function bulkDeleteRoles(roleIds: string[]): Promise<ActionResult> {
  const session = await requireRolePermission('roles.delete')

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

  const ip = await getClientIp()
  after(async () => {
    await logAudit({
      module: Module.Roles,
      action: AuditAction.BulkDeleted,
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      userRole: session.user.role?.name,
      newValues: { roleIds, count: roleIds.length },
      ipAddress: ip,
    })
  })

  revalidatePath('/admin/roles')
  return { success: true }
}
