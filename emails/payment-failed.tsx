/**
 * @file payment-failed.tsx
 * @module emails/payment-failed
 * Payment failed template — sent when a Stripe invoice payment fails.
 */

import { Section, Text } from '@react-email/components'

import { EmailLayout } from './components/email-layout'
import { EmailButton } from './components/email-button'
import { EmailHeading } from './components/email-heading'
import { EMAIL_APP_NAME } from '../src/features/email/constants'

interface PaymentFailedProps {
  name: string
  updatePaymentUrl: string
}

export const PaymentFailed = ({
  name,
  updatePaymentUrl,
}: PaymentFailedProps): React.ReactElement => (
  <EmailLayout preview={`Payment failed — ${EMAIL_APP_NAME}`}>
    <EmailHeading>Payment failed</EmailHeading>
    <Text className="text-sm text-gray-700">Hi {name},</Text>
    <Text className="text-sm text-gray-700">
      We were unable to process your latest payment. Please update your payment method to avoid any
      interruption to your service.
    </Text>
    <Section className="my-6 text-center">
      <EmailButton href={updatePaymentUrl}>Update Payment Method</EmailButton>
    </Section>
  </EmailLayout>
)

PaymentFailed.PreviewProps = {
  name: 'John',
  updatePaymentUrl: 'http://localhost:3000/dashboard/billing',
} satisfies PaymentFailedProps

export default PaymentFailed
