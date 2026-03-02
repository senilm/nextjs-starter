/**
 * @file sign-in-form.tsx
 * @module features/auth/components/sign-in-form
 * Sign-in form with email/password tab, magic link tab, and social login.
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'

import { authClient } from '@/lib/auth-client'
import { signInSchema, magicLinkSchema, type SignInInput, type MagicLinkInput } from '@/features/auth/validations'
import { SocialButtons } from '@/features/auth/components/social-buttons'

export const SignInForm = () => {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  const emailForm = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  })

  const magicForm = useForm<MagicLinkInput>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: '' },
  })

  const onEmailSubmit = async (data: SignInInput): Promise<void> => {
    setError(null)
    setIsPending(true)

    const { error: signInError } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    })

    setIsPending(false)

    if (signInError) {
      setError(signInError.message ?? 'Invalid credentials')
      return
    }

    router.push('/dashboard')
  }

  const onMagicLinkSubmit = async (data: MagicLinkInput): Promise<void> => {
    setError(null)
    setIsPending(true)

    const { error: magicError } = await authClient.signIn.magicLink({
      email: data.email,
      callbackURL: '/dashboard',
    })

    setIsPending(false)

    if (magicError) {
      setError(magicError.message ?? 'Failed to send magic link')
      return
    }

    setMagicLinkSent(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-6"
    >
      <SocialButtons />

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
          or continue with email
        </span>
      </div>

      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email">Email & Password</TabsTrigger>
          <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="mt-4">
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
              <FormField
                control={emailForm.control}
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
              <FormField
                control={emailForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link
                        href="/forgot-password"
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <PasswordInput placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-destructive"
                >
                  {error}
                </motion.p>
              )}

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="magic-link" className="mt-4">
          {magicLinkSent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-6 text-center"
            >
              <p className="text-sm font-medium">Check your email</p>
              <p className="mt-1 text-sm text-muted-foreground">
                We sent a sign-in link to your email address.
              </p>
            </motion.div>
          ) : (
            <Form {...magicForm}>
              <form
                onSubmit={magicForm.handleSubmit(onMagicLinkSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={magicForm.control}
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

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-destructive"
                  >
                    {error}
                  </motion.p>
                )}

                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    'Send magic link'
                  )}
                </Button>
              </form>
            </Form>
          )}
        </TabsContent>
      </Tabs>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/sign-up" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </motion.div>
  )
}
