/**
 * @file page.tsx
 * @module app/(dashboard)/dashboard/settings/page
 * Account settings page — thin wrapper around AccountSettings feature component.
 */

import type { Metadata } from 'next'

import { AccountSettings } from '@/features/settings/components/account-settings'

export const metadata: Metadata = {
  title: 'Account Settings',
}

export default function SettingsPage(): React.ReactNode {
  return <AccountSettings />
}
