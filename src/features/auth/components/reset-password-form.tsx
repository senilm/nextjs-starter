/**
 * @file reset-password-form.tsx
 * @module features/auth/components/reset-password-form
 * Reset password form — validates token from URL and sets new password.
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { authClient } from '@/lib/auth-client'
import { paths } from '@/lib/paths'
import { resetPasswordSchema, type ResetPasswordInput } from '@/features/auth/validations'

export const ResetPasswordForm = () => {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [success, setSuccess] = useState(false)

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onSubmit = async (data: ResetPasswordInput): Promise<void> => {
    setIsPending(true)

    const { error: resetError } = await authClient.resetPassword({
      newPassword: data.password,
    })

    setIsPending(false)

    if (resetError) {
      toast.error(resetError.message ?? 'Failed to reset password')
      return
    }

    setSuccess(true)
    setTimeout(() => router.push(paths.auth.signIn()), 2000)
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm font-medium">Password reset successful</p>
        <p className="text-sm text-muted-foreground">Redirecting to sign in...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-center text-sm text-muted-foreground">
        Enter your new password below.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="Min 8 characters" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="Confirm your password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" loading={isPending}>
            Reset password
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        <Link href={paths.auth.signIn()} className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
