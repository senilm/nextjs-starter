/**
 * @file user-invitation.tsx
 * @module emails/user-invitation
 * User invitation template — sent when an admin invites a new user.
 */

import { Section, Text } from '@react-email/components'

import { EmailLayout } from './components/email-layout'
import { EmailButton } from './components/email-button'
import { EmailHeading } from './components/email-heading'
import { EMAIL_APP_NAME } from '../src/features/email/constants'

interface UserInvitationProps {
  inviterName: string
  roleName: string
  signUpUrl: string
}

export const UserInvitation = ({
  inviterName,
  roleName,
  signUpUrl,
}: UserInvitationProps): React.ReactElement => (
  <EmailLayout preview={`You've been invited to ${EMAIL_APP_NAME}`}>
    <EmailHeading>You&apos;ve been invited</EmailHeading>
    <Text className="text-sm text-gray-700">
      {inviterName} has invited you to join {EMAIL_APP_NAME} as a <strong>{roleName}</strong>.
    </Text>
    <Text className="text-sm text-gray-700">
      Click the button below to create your account and get started.
    </Text>
    <Section className="my-6 text-center">
      <EmailButton href={signUpUrl}>Accept Invitation</EmailButton>
    </Section>
    <Text className="text-xs text-gray-500">This invitation link expires in 7 days.</Text>
  </EmailLayout>
)

UserInvitation.PreviewProps = {
  inviterName: 'Jane Admin',
  roleName: 'Editor',
  signUpUrl: 'http://localhost:3000/sign-up?token=abc123',
} satisfies UserInvitationProps

export default UserInvitation
