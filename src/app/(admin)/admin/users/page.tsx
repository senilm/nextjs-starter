/**
 * @file page.tsx
 * @module app/(admin)/admin/users/page
 * Admin user management page — thin wrapper for the UserManagement feature component.
 */

import { UserManagement } from '@/features/admin/components/user-management'

export default function AdminUsersPage(): React.ReactNode {
  return <UserManagement />
}
