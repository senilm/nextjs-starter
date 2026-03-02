/**
 * @file page.tsx
 * @module app/(admin)/admin/settings/page
 * Admin system settings page — thin wrapper for the SystemSettingsForm feature component.
 */

import { SystemSettingsForm } from '@/features/admin/components/system-settings-form'

export default function AdminSettingsPage(): React.ReactNode {
  return <SystemSettingsForm />
}
