/**
 * @file constants.ts
 * @module lib/constants
 * Application-wide enums and constants — single source of truth for permission keys.
 */

export enum Module {
  Admin = 'admin',
  Users = 'users',
  Roles = 'roles',
  Plans = 'plans',
  Settings = 'settings',
  Projects = 'projects',
  Billing = 'billing',
  Audits = 'audits',
}

export enum Action {
  Access = 'access',
  View = 'view',
  Create = 'create',
  Edit = 'edit',
  Delete = 'delete',
  Manage = 'manage',
}

export enum AuditAction {
  Created = 'created',
  Updated = 'updated',
  Deleted = 'deleted',
  Suspended = 'suspended',
  Unsuspended = 'unsuspended',
  Invited = 'invited',
  Canceled = 'canceled',
  Resumed = 'resumed',
  RoleChanged = 'role_changed',
  Revoked = 'revoked',
  Checkout = 'checkout',
  BulkDeleted = 'bulk_deleted',
}

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  EXPORT_MAX_LIMIT: 10_000,
} as const

/** Type-safe permission key builder */
export function perm(module: Module, action: Action): string {
  return `${module}.${action}`
}
