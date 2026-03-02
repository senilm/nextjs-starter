/**
 * @file password-reset.tsx
 * @module emails/password-reset
 * Password reset template — sent when user requests a password reset.
 */

import { Section, Text } from '@react-email/components'

import { EmailLayout } from './components/email-layout'
import { EmailButton } from './components/email-button'
import { EmailHeading } from './components/email-heading'
import { EMAIL_APP_NAME } from '../src/features/email/constants'

interface PasswordResetProps {
  name: string
  resetUrl: string
}

export const PasswordReset = ({ name, resetUrl }: PasswordResetProps): React.ReactElement => (
  <EmailLayout preview={`Reset your ${EMAIL_APP_NAME} password`}>
    <EmailHeading>Reset your password</EmailHeading>
    <Text className="text-sm text-gray-700">Hi {name},</Text>
    <Text className="text-sm text-gray-700">
      We received a request to reset your password. Click the button below to choose a new one.
    </Text>
    <Section className="my-6 text-center">
      <EmailButton href={resetUrl}>Reset Password</EmailButton>
    </Section>
    <Text className="text-xs text-gray-500">
      If you didn&apos;t request a password reset, you can safely ignore this email.
    </Text>
  </EmailLayout>
)

PasswordReset.PreviewProps = {
  name: 'John',
  resetUrl: 'http://localhost:3000/reset-password?token=abc123',
} satisfies PasswordResetProps

export default PasswordReset
