/**
 * @file email-heading.tsx
 * @module emails/components/email-heading
 * Consistent heading component for email templates.
 */

import { Heading } from '@react-email/components'

interface EmailHeadingProps {
  children: React.ReactNode
}

export const EmailHeading = ({ children }: EmailHeadingProps): React.ReactElement => (
  <Heading className="text-xl font-semibold text-gray-900">{children}</Heading>
)
