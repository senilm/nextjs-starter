/**
 * @file types.ts
 * @module features/roles/types
 * Types for the roles management feature.
 */

export interface RoleWithPermissions {
  id: string
  name: string
  description: string | null
  isSystem: boolean
  isDefault: boolean
  userCount: number
  permissionKeys: string[]
  createdAt: Date
}

export interface PermissionGroup {
  module: string
  permissions: {
    key: string
    action: string
    description: string | null
  }[]
}

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}
