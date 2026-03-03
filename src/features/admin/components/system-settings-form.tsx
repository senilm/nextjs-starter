/**
 * @file system-settings-form.tsx
 * @module features/admin/components/system-settings-form
 * Form for managing system settings — site name, URL, support email, announcement, maintenance.
 */

'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/shared/page-header'
import { usePermission } from '@/hooks/use-permission'
import { useSystemSettings, useUpdateSystemSettings } from '@/features/admin/hooks'
import { systemSettingsSchema, type SystemSettingsInput } from '@/features/admin/validations'

export const SystemSettingsForm = (): React.ReactNode => {
  const canEdit = usePermission('settings.edit')
  const { data: settings, isLoading } = useSystemSettings()
  const updateMutation = useUpdateSystemSettings()

  const form = useForm<SystemSettingsInput>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      siteName: '',
      siteUrl: '',
      supportEmail: '',
      announcementBar: '',
      maintenanceMode: false,
    },
  })

  useEffect(() => {
    if (settings) {
      form.reset({
        siteName: settings.siteName,
        siteUrl: settings.siteUrl,
        supportEmail: settings.supportEmail,
        announcementBar: settings.announcementBar ?? '',
        maintenanceMode: settings.maintenanceMode,
      })
    }
  }, [settings, form])

  const onSubmit = async (data: SystemSettingsInput): Promise<void> => {
    await updateMutation.mutateAsync(data)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="System Settings" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="System Settings" description="Configure global platform settings." />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General</CardTitle>
              <CardDescription>Basic site configuration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="siteName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!canEdit} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="siteUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site URL</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!canEdit} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supportEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Support Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" disabled={!canEdit} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Announcement</CardTitle>
              <CardDescription>Display a banner across the top of the site.</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="announcementBar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Announcement Text</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} disabled={!canEdit} placeholder="Leave empty to hide the banner" />
                    </FormControl>
                    <FormDescription>Shown at the top of all pages when set.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Maintenance Mode</CardTitle>
              <CardDescription>When enabled, only admins can access the site.</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="maintenanceMode"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel className="cursor-pointer">Enable Maintenance Mode</FormLabel>
                      <FormDescription>Regular users will see a maintenance page.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} disabled={!canEdit} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {canEdit && (
            <div className="flex justify-end">
              <Button type="submit" loading={updateMutation.isPending}>
                Save Settings
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  )
}
