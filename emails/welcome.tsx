/**
 * @file welcome.tsx
 * @module emails/welcome
 * Welcome template — sent after email verification is complete.
 */

import { Section, Text } from '@react-email/components'

import { EmailLayout } from './components/email-layout'
import { EmailButton } from './components/email-button'
import { EmailHeading } from './components/email-heading'
import { EMAIL_APP_NAME } from '../src/features/email/constants'

interface WelcomeProps {
  name: string
  dashboardUrl: string
}

export const Welcome = ({ name, dashboardUrl }: WelcomeProps): React.ReactElement => (
  <EmailLayout preview={`Welcome to ${EMAIL_APP_NAME}!`}>
    <EmailHeading>Welcome to {EMAIL_APP_NAME}!</EmailHeading>
    <Text className="text-sm text-gray-700">Hi {name},</Text>
    <Text className="text-sm text-gray-700">
      Your email has been verified and your account is ready to go. Head to your dashboard to get
      started.
    </Text>
    <Section className="my-6 text-center">
      <EmailButton href={dashboardUrl}>Go to Dashboard</EmailButton>
    </Section>
  </EmailLayout>
)

Welcome.PreviewProps = {
  name: 'John',
  dashboardUrl: 'http://localhost:3000/dashboard',
} satisfies WelcomeProps

export default Welcome
