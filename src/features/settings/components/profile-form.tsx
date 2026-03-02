/**
 * @file profile-form.tsx
 * @module features/settings/components/profile-form
 * Profile update form — name and email (read-only).
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useSession } from '@/lib/auth-client'
import { updateProfile } from '@/features/settings/actions'
import { profileSchema, type ProfileInput } from '@/features/settings/validations'

export const ProfileForm = (): React.ReactNode => {
  const { data: session } = useSession()

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: session?.user?.name ?? '' },
    values: { name: session?.user?.name ?? '' },
  })

  const onSubmit = async (data: ProfileInput): Promise<void> => {
    const result = await updateProfile(data)
    if (result.success) {
      toast.success('Profile updated')
    } else {
      toast.error(result.error ?? 'Failed to update profile')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your personal information.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input value={session?.user?.email ?? ''} disabled className="mt-1.5" />
              <p className="mt-1 text-xs text-muted-foreground">Contact support to change your email.</p>
            </div>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save changes'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
