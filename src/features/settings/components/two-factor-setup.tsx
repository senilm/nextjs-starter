/**
 * @file two-factor-setup.tsx
 * @module features/settings/components/two-factor-setup
 * Enable/disable 2FA with TOTP QR code and backup codes display.
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Shield, ShieldCheck, Copy } from 'lucide-react'

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
import { authClient } from '@/lib/auth-client'
import { twoFactorVerifySchema, type TwoFactorVerifyInput } from '@/features/settings/validations'

type SetupStep = 'idle' | 'qr' | 'backup'

export const TwoFactorSetup = (): React.ReactNode => {
  const { data: session } = useSession()
  const [step, setStep] = useState<SetupStep>('idle')
  const [totpUri, setTotpUri] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [isPending, setIsPending] = useState(false)

  const isEnabled = (session?.user as { twoFactorEnabled?: boolean } | undefined)?.twoFactorEnabled ?? false

  const form = useForm<TwoFactorVerifyInput>({
    resolver: zodResolver(twoFactorVerifySchema),
    defaultValues: { code: '' },
  })

  const handleEnable = async (): Promise<void> => {
    setIsPending(true)
    const { data, error } = await authClient.twoFactor.enable({ password: '' })
    setIsPending(false)

    if (error) {
      toast.error(error.message ?? 'Failed to start 2FA setup')
      return
    }

    if (data?.totpURI) {
      setTotpUri(data.totpURI)
      setBackupCodes(data.backupCodes ?? [])
      setStep('qr')
    }
  }

  const handleVerify = async (values: TwoFactorVerifyInput): Promise<void> => {
    const { error } = await authClient.twoFactor.verifyTotp({ code: values.code })

    if (error) {
      toast.error(error.message ?? 'Invalid code')
      return
    }

    toast.success('Two-factor authentication enabled')
    setStep('backup')
  }

  const handleDisable = async (): Promise<void> => {
    setIsPending(true)
    const { error } = await authClient.twoFactor.disable({ password: '' })
    setIsPending(false)

    if (error) {
      toast.error(error.message ?? 'Failed to disable 2FA')
      return
    }

    toast.success('Two-factor authentication disabled')
    setStep('idle')
    setTotpUri('')
    setBackupCodes([])
  }

  const copyBackupCodes = (): void => {
    void navigator.clipboard.writeText(backupCodes.join('\n'))
    toast.success('Backup codes copied to clipboard')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEnabled ? <ShieldCheck className="size-5 text-emerald-500" /> : <Shield className="size-5" />}
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          {isEnabled
            ? 'Your account is protected with 2FA.'
            : 'Add an extra layer of security to your account.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'idle' && !isEnabled && (
          <Button onClick={handleEnable} disabled={isPending}>
            {isPending ? 'Setting up...' : 'Enable 2FA'}
          </Button>
        )}

        {step === 'idle' && isEnabled && (
          <Button variant="destructive" onClick={handleDisable} disabled={isPending}>
            {isPending ? 'Disabling...' : 'Disable 2FA'}
          </Button>
        )}

        {step === 'qr' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Scan this QR code with your authenticator app, then enter the verification code below.
            </p>
            <div className="flex justify-center rounded-lg border bg-white p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpUri)}`}
                alt="2FA QR Code"
                width={200}
                height={200}
              />
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleVerify)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification code</FormLabel>
                      <FormControl>
                        <Input placeholder="000000" maxLength={6} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Verifying...' : 'Verify & Enable'}
                </Button>
              </form>
            </Form>
          </div>
        )}

        {step === 'backup' && backupCodes.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Save these backup codes in a safe place. You can use them to sign in if you lose access to your authenticator.
            </p>
            <div className="rounded-lg border bg-muted p-4">
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code) => (
                  <code key={code} className="text-sm font-mono">
                    {code}
                  </code>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={copyBackupCodes}>
                <Copy className="mr-2 size-4" />
                Copy codes
              </Button>
              <Button onClick={() => setStep('idle')}>Done</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
