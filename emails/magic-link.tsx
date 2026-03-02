/**
 * @file magic-link.tsx
 * @module emails/magic-link
 * Magic link login template — sent for passwordless authentication.
 */

import { Section, Text } from '@react-email/components'

import { EmailLayout } from './components/email-layout'
import { EmailButton } from './components/email-button'
import { EmailHeading } from './components/email-heading'
import { EMAIL_APP_NAME } from '../src/features/email/constants'

interface MagicLinkProps {
  loginUrl: string
}

export const MagicLink = ({ loginUrl }: MagicLinkProps): React.ReactElement => (
  <EmailLayout preview={`Sign in to ${EMAIL_APP_NAME}`}>
    <EmailHeading>Sign in to {EMAIL_APP_NAME}</EmailHeading>
    <Text className="text-sm text-gray-700">
      Click the button below to sign in to your account. This link expires in 10 minutes.
    </Text>
    <Section className="my-6 text-center">
      <EmailButton href={loginUrl}>Sign In</EmailButton>
    </Section>
    <Text className="text-xs text-gray-500">
      If you didn&apos;t request this link, you can safely ignore this email.
    </Text>
  </EmailLayout>
)

MagicLink.PreviewProps = {
  loginUrl: 'http://localhost:3000/api/auth/magic-link/verify?token=abc123',
} satisfies MagicLinkProps

export default MagicLink
