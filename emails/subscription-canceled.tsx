/**
 * @file subscription-canceled.tsx
 * @module emails/subscription-canceled
 * Subscription canceled template — sent when a user cancels their subscription.
 */

import { Section, Text } from '@react-email/components'

import { EmailLayout } from './components/email-layout'
import { EmailButton } from './components/email-button'
import { EmailHeading } from './components/email-heading'
import { EMAIL_APP_NAME } from '../src/features/email/constants'

interface SubscriptionCanceledProps {
  name: string
  accessUntil: string
  resubscribeUrl: string
}

export const SubscriptionCanceled = ({
  name,
  accessUntil,
  resubscribeUrl,
}: SubscriptionCanceledProps): React.ReactElement => (
  <EmailLayout preview={`Subscription canceled — ${EMAIL_APP_NAME}`}>
    <EmailHeading>Subscription canceled</EmailHeading>
    <Text className="text-sm text-gray-700">Hi {name},</Text>
    <Text className="text-sm text-gray-700">
      Your subscription has been canceled. You&apos;ll continue to have access to your current plan
      until <strong>{accessUntil}</strong>.
    </Text>
    <Text className="text-sm text-gray-700">
      Changed your mind? You can resubscribe at any time.
    </Text>
    <Section className="my-6 text-center">
      <EmailButton href={resubscribeUrl}>Resubscribe</EmailButton>
    </Section>
  </EmailLayout>
)

SubscriptionCanceled.PreviewProps = {
  name: 'John',
  accessUntil: 'April 1, 2026',
  resubscribeUrl: 'http://localhost:3000/dashboard/billing',
} satisfies SubscriptionCanceledProps

export default SubscriptionCanceled
