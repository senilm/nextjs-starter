/**
 * @file payment-confirmation.tsx
 * @module emails/payment-confirmation
 * Payment confirmation template — sent when a Stripe payment succeeds.
 */

import { Section, Text } from '@react-email/components'

import { EmailLayout } from './components/email-layout'
import { EmailButton } from './components/email-button'
import { EmailHeading } from './components/email-heading'
import { EMAIL_APP_NAME, EMAIL_APP_URL } from '../src/features/email/constants'
import { paths } from '../src/lib/paths'

interface PaymentConfirmationProps {
  name: string
  planName: string
  amount: string
  nextBillingDate: string
}

export const PaymentConfirmation = ({
  name,
  planName,
  amount,
  nextBillingDate,
}: PaymentConfirmationProps): React.ReactElement => (
  <EmailLayout preview={`Payment confirmed — ${EMAIL_APP_NAME}`}>
    <EmailHeading>Payment confirmed</EmailHeading>
    <Text className="text-sm text-gray-700">Hi {name},</Text>
    <Text className="text-sm text-gray-700">
      Your payment of <strong>{amount}</strong> for the <strong>{planName}</strong> plan has been
      processed successfully.
    </Text>
    <Text className="text-sm text-gray-700">
      Next billing date: <strong>{nextBillingDate}</strong>
    </Text>
    <Section className="my-6 text-center">
      <EmailButton href={`${EMAIL_APP_URL}${paths.dashboard.billing()}`}>Manage Billing</EmailButton>
    </Section>
  </EmailLayout>
)

PaymentConfirmation.PreviewProps = {
  name: 'John',
  planName: 'Pro',
  amount: '$19.00',
  nextBillingDate: 'April 1, 2026',
} satisfies PaymentConfirmationProps

export default PaymentConfirmation
