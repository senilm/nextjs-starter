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
}

export enum Action {
  Access = 'access',
  View = 'view',
  Create = 'create',
  Edit = 'edit',
  Delete = 'delete',
}

/** Type-safe permission key builder */
export function perm(module: Module, action: Action): string {
  return `${module}.${action}`
}
