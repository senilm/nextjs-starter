/**
 * @file delete-account.tsx
 * @module features/settings/components/delete-account
 * Danger zone — account deletion with password confirmation dialog.
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { DialogShell, DialogBody, DialogFooter } from '@/components/shared/dialog-shell'
import { paths } from '@/lib/paths'
import { deleteAccount } from '@/features/settings/actions'
import { deleteAccountSchema, type DeleteAccountInput } from '@/features/settings/validations'

export const DeleteAccount = (): React.ReactNode => {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const form = useForm<DeleteAccountInput>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: { confirmation: '' as 'DELETE', password: '' },
  })

  const onSubmit = async (values: DeleteAccountInput): Promise<void> => {
    const result = await deleteAccount(values.password)
    if (result.success) {
      toast.success('Account deleted')
      router.push(paths.auth.signIn())
    } else {
      toast.error(result.error ?? 'Failed to delete account')
    }
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          Delete your account and deactivate access. An administrator may be able to restore your account if needed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Delete account
        </Button>

        <DialogShell
          open={open}
          onOpenChange={setOpen}
          title="Are you absolutely sure?"
          description="This will deactivate your account and you will lose access to all projects and data. Type DELETE to confirm."
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DialogBody className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <PasswordInput placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmation</FormLabel>
                      <FormControl>
                        <Input placeholder="Type DELETE" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </DialogBody>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  loading={form.formState.isSubmitting}
                >
                  Delete my account
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogShell>
      </CardContent>
    </Card>
  )
}
