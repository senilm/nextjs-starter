/**
 * @file forgot-password-form.tsx
 * @module features/auth/components/forgot-password-form
 * Forgot password form — always shows success to prevent email enumeration.
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'motion/react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/features/auth/validations'

export const ForgotPasswordForm = () => {
  const [submitted, setSubmitted] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: ForgotPasswordInput): Promise<void> => {
    setIsPending(true)
    await authClient.$fetch('/forget-password', {
      method: 'POST',
      body: { email: data.email, redirectTo: paths.auth.resetPassword() },
    })
    setIsPending(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="space-y-4 text-center"
      >
        <p className="text-sm font-medium">Check your email</p>
        <p className="text-sm text-muted-foreground">
          If an account with that email exists, we sent a password reset link.
        </p>
        <Link href={paths.auth.signIn()} className="text-sm text-primary hover:underline">
          Back to sign in
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-6"
    >
      <p className="text-center text-sm text-muted-foreground">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" loading={isPending}>
            Send reset link
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/sign-in" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </motion.div>
  )
}
