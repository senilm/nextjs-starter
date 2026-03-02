/**
 * @file email-layout.tsx
 * @module emails/components/email-layout
 * Shared layout wrapper for all email templates — header, body, footer.
 */

import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
  Hr,
} from '@react-email/components'

import { EMAIL_APP_NAME, EMAIL_SUPPORT } from '../../src/features/email/constants'

interface EmailLayoutProps {
  preview: string
  children: React.ReactNode
}

export const EmailLayout = ({ preview, children }: EmailLayoutProps): React.ReactElement => {
  const year = new Date().getFullYear()

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="mx-auto my-0 bg-gray-50 font-sans">
          <Container className="mx-auto my-10 max-w-[560px] rounded-lg border border-solid border-gray-200 bg-white px-10 py-5">
            <Section className="mt-4">
              <Text className="text-center text-xl font-bold text-gray-900">
                {EMAIL_APP_NAME}
              </Text>
            </Section>

            {children}

            <Hr className="my-6 border-gray-200" />

            <Section>
              <Text className="text-center text-xs text-gray-500">
                {EMAIL_APP_NAME} &mdash; {EMAIL_SUPPORT}
              </Text>
              <Text className="text-center text-xs text-gray-400">
                &copy; {year} {EMAIL_APP_NAME}. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
