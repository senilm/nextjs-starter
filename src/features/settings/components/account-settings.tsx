/**
 * @file account-settings.tsx
 * @module features/settings/components/account-settings
 * Tabbed account settings with animated content switching.
 */

'use client'

import { UserRound, Lock, ShieldCheck, Trash2 } from 'lucide-react'

import { Tabs, TabsList, TabsTrigger, TabsContent, TabsContents } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/page-header'
import { ProfileForm } from '@/features/settings/components/profile-form'
import { ChangePasswordForm } from '@/features/settings/components/change-password-form'
import { TwoFactorSetup } from '@/features/settings/components/two-factor-setup'
import { ActiveSessions } from '@/features/settings/components/active-sessions'
import { DeleteAccount } from '@/features/settings/components/delete-account'

export const AccountSettings = (): React.ReactNode => {
  return (
    <div className="space-y-6">
      <PageHeader title="Account Settings" description="Manage your account preferences and security." />
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">
            <UserRound className="size-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="password">
            <Lock className="size-4" />
            Password
          </TabsTrigger>
          <TabsTrigger value="security">
            <ShieldCheck className="size-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="danger">
            <Trash2 className="size-4" />
            Danger Zone
          </TabsTrigger>
        </TabsList>
        <TabsContents className="mt-6">
          <TabsContent value="profile">
            <ProfileForm />
          </TabsContent>
          <TabsContent value="password">
            <ChangePasswordForm />
          </TabsContent>
          <TabsContent value="security">
            <div className="grid gap-6">
              <TwoFactorSetup />
              <ActiveSessions />
            </div>
          </TabsContent>
          <TabsContent value="danger">
            <DeleteAccount />
          </TabsContent>
        </TabsContents>
      </Tabs>
    </div>
  )
}
