/**
 * @file verify-email.tsx
 * @module features/auth/components/verify-email
 * Email verification waiting screen with resend button and auto-check.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

const RESEND_COOLDOWN_SECONDS = 60

export const VerifyEmail = () => {
  const router = useRouter()
  const [cooldown, setCooldown] = useState(0)
  const [resending, setResending] = useState(false)

  const checkVerification = useCallback(async () => {
    const { data } = await authClient.getSession()
    if (data?.user?.emailVerified) {
      router.push('/dashboard')
    }
  }, [router])

  useEffect(() => {
    const interval = setInterval(checkVerification, 3000)
    return () => clearInterval(interval)
  }, [checkVerification])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const handleResend = async (): Promise<void> => {
    setResending(true)
    await authClient.sendVerificationEmail({
      email: '',
      callbackURL: '/dashboard',
    })
    setResending(false)
    setCooldown(RESEND_COOLDOWN_SECONDS)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-6 text-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
      >
        <Mail className="h-8 w-8 text-primary" />
      </motion.div>

      <div className="space-y-2">
        <p className="text-lg font-semibold">Check your email</p>
        <p className="text-sm text-muted-foreground">
          We sent a verification link to your email address. Click the link to verify your
          account.
        </p>
      </div>

      <Button
        variant="outline"
        onClick={handleResend}
        disabled={cooldown > 0 || resending}
        className="w-full"
      >
        {resending
          ? 'Sending...'
          : cooldown > 0
            ? `Resend in ${cooldown}s`
            : 'Resend verification email'}
      </Button>

      <p className="text-xs text-muted-foreground">
        This page will automatically redirect once verified.
      </p>
    </motion.div>
  )
}
