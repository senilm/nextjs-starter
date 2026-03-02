/**
 * @file email-button.tsx
 * @module emails/components/email-button
 * Styled CTA button reused across all email templates.
 */

import { Button } from '@react-email/components'

interface EmailButtonProps {
  href: string
  children: React.ReactNode
}

export const EmailButton = ({ href, children }: EmailButtonProps): React.ReactElement => (
  <Button
    href={href}
    className="inline-block rounded-md bg-gray-900 px-6 py-3 text-center text-sm font-semibold text-white no-underline"
  >
    {children}
  </Button>
)
