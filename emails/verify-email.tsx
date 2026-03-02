/**
 * @file verify-email.tsx
 * @module emails/verify-email
 * Email verification template — sent on registration or email change.
 */

import { Section, Text } from '@react-email/components'

import { EmailLayout } from './components/email-layout'
import { EmailButton } from './components/email-button'
import { EmailHeading } from './components/email-heading'
import { EMAIL_APP_NAME } from '../src/features/email/constants'

interface VerifyEmailProps {
  name: string
  verifyUrl: string
}

export const VerifyEmail = ({ name, verifyUrl }: VerifyEmailProps): React.ReactElement => (
  <EmailLayout preview={`Verify your email for ${EMAIL_APP_NAME}`}>
    <EmailHeading>Verify your email</EmailHeading>
    <Text className="text-sm text-gray-700">Hi {name},</Text>
    <Text className="text-sm text-gray-700">
      Thanks for signing up for {EMAIL_APP_NAME}. Please verify your email address by clicking the
      button below.
    </Text>
    <Section className="my-6 text-center">
      <EmailButton href={verifyUrl}>Verify Email</EmailButton>
    </Section>
    <Text className="text-xs text-gray-500">
      If you didn&apos;t create an account, you can safely ignore this email.
    </Text>
  </EmailLayout>
)

VerifyEmail.PreviewProps = {
  name: 'John',
  verifyUrl: 'http://localhost:3000/api/auth/verify-email?token=abc123',
} satisfies VerifyEmailProps

export default VerifyEmail
