/**
 * @file contact-form.tsx
 * @module emails/contact-form
 * Contact form template — sent to support when a visitor submits the contact form.
 */

import { Text, Hr } from '@react-email/components'

import { EmailLayout } from './components/email-layout'
import { EmailHeading } from './components/email-heading'
import { EMAIL_APP_NAME } from '../src/features/email/constants'

interface ContactFormProps {
  senderName: string
  senderEmail: string
  message: string
}

export const ContactForm = ({
  senderName,
  senderEmail,
  message,
}: ContactFormProps): React.ReactElement => (
  <EmailLayout preview={`New contact form submission — ${EMAIL_APP_NAME}`}>
    <EmailHeading>New contact form message</EmailHeading>
    <Text className="text-sm text-gray-700">
      <strong>From:</strong> {senderName} ({senderEmail})
    </Text>
    <Hr className="my-4 border-gray-200" />
    <Text className="whitespace-pre-wrap text-sm text-gray-700">{message}</Text>
  </EmailLayout>
)

ContactForm.PreviewProps = {
  senderName: 'Jane Doe',
  senderEmail: 'jane@example.com',
  message: 'Hi, I have a question about your product. Can you help me?',
} satisfies ContactFormProps

export default ContactForm
