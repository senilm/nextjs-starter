/**
 * @file account-settings.tsx
 * @module features/settings/components/account-settings
 * Container rendering all account settings cards.
 */

'use client'

import { PageHeader } from '@/components/shared/page-header'
import { ProfileForm } from '@/features/settings/components/profile-form'
import { ChangePasswordForm } from '@/features/settings/components/change-password-form'
import { TwoFactorSetup } from '@/features/settings/components/two-factor-setup'
import { ActiveSessions } from '@/features/settings/components/active-sessions'
import { DeleteAccount } from '@/features/settings/components/delete-account'

export const AccountSettings = (): React.ReactNode => {
  return (
    <div className="space-y-8">
      <PageHeader title="Account Settings" description="Manage your account preferences and security." />
      <div className="grid gap-6">
        <ProfileForm />
        <ChangePasswordForm />
        <TwoFactorSetup />
        <ActiveSessions />
        <DeleteAccount />
      </div>
    </div>
  )
}
