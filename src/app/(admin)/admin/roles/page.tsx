/**
 * @file page.tsx
 * @module app/(admin)/admin/roles/page
 * Admin roles management page — thin wrapper for the RolesList feature component.
 */

import { RolesList } from '@/features/roles/components/roles-list'

export default function AdminRolesPage(): React.ReactNode {
  return <RolesList />
}
