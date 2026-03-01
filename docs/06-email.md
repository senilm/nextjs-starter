# Module 06: Email System

React Email templates sent via Resend. Every email is a React component the buyer customizes by editing JSX.

---

## File Structure

```
emails/
├── components/
│   ├── email-layout.tsx        ← Shared layout (header, footer, branding)
│   ├── email-button.tsx        ← Styled CTA button
│   └── email-heading.tsx       ← Consistent heading styles
├── welcome.tsx
├── verify-email.tsx
├── password-reset.tsx
├── magic-link.tsx
├── user-invitation.tsx
├── payment-confirmation.tsx
├── payment-failed.tsx
├── subscription-canceled.tsx
└── contact-form.tsx

src/features/email/
├── send.ts                     ← sendEmail() helper — single entry point
└── constants.ts                ← Shared email copy, app name, URLs
```

`emails/` is the top-level directory (React Email convention for `npx email dev` preview). `src/features/email/send.ts` is the helper that renders and sends.

---

## Send Helper

Location: `src/features/email/send.ts`

```typescript
import { Resend } from 'resend'
import { render } from '@react-email/render'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailOptions {
  to: string | string[]
  subject: string
  template: React.ReactElement
  replyTo?: string
}

export async function sendEmail({ to, subject, template, replyTo }: SendEmailOptions) {
  const html = await render(template)

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    replyTo,
  })

  if (error) {
    console.error('Email send failed:', error)
    throw new Error('Failed to send email')
  }

  return data
}
```

All emails go through this helper. Never call Resend directly.

---

## Shared Layout

Every email wraps in a consistent layout:

```tsx
// emails/components/email-layout.tsx
import { Body, Container, Head, Html, Preview, Tailwind, Img, Hr, Text } from '@react-email/components'

interface EmailLayoutProps {
  preview: string
  children: React.ReactNode
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto max-w-xl py-8">
            {/* App logo or name */}
            {children}
            {/* Footer: company name, support email, unsubscribe hint */}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
```

---

## 9 Templates

### Template Pattern

Every template follows this structure:

```tsx
interface TemplateProps {
  name: string
  // ... template-specific props
}

export function TemplateName({ name, ... }: TemplateProps) {
  return (
    <EmailLayout preview="Preview text shown in inbox">
      <Section className="bg-white rounded-lg p-8">
        {/* Content */}
      </Section>
    </EmailLayout>
  )
}

// Default props for preview (npx email dev)
TemplateName.PreviewProps = {
  name: 'John',
  // ... sample data
}

export default TemplateName
```

### Specifications

| Template | Trigger | Props | Key Content |
|---|---|---|---|
| Welcome | After email verification | `name`, `dashboardUrl` | Greeting, quick-start link, support contact |
| Verify Email | Registration or email change | `name`, `verifyUrl` | Verification link (24h expiry) |
| Password Reset | Forgot-password request | `name`, `resetUrl` | Reset link (1h expiry), didn't-request-this note |
| Magic Link | Magic link login request | `loginUrl` | One-time login link (15min expiry) |
| User Invitation | Admin invites a user | `inviterName`, `roleName`, `signUpUrl` | Sign-up link with invite token, role they'll be assigned |
| Payment Confirmation | Stripe payment succeeds | `name`, `planName`, `amount`, `nextBillingDate` | Plan name, amount charged, next billing date |
| Payment Failed | Stripe invoice fails | `name`, `updatePaymentUrl` | "Update payment method" CTA, portal link |
| Subscription Canceled | User cancels subscription | `name`, `accessUntil`, `resubscribeUrl` | Access until period end date, re-subscribe link |
| Contact Form | Contact form submitted | `senderName`, `senderEmail`, `message` | Sender info and message (sent to admin email) |

---

## Integration Points

### Auth Events (in `src/lib/auth.ts`)

```typescript
// Email verification
emailVerification: {
  sendVerificationEmail: async ({ user, url }) => {
    await sendEmail({
      to: user.email,
      subject: 'Verify your email',
      template: <VerifyEmail name={user.name} verifyUrl={url} />,
    })
  },
},

// Password reset
sendResetPassword: async ({ user, url }) => {
  await sendEmail({
    to: user.email,
    subject: 'Reset your password',
    template: <PasswordResetEmail name={user.name} resetUrl={url} />,
  })
},

// Magic link
magicLink: {
  sendMagicLink: async ({ email, url }) => {
    await sendEmail({
      to: email,
      subject: `Your login link for ${APP_NAME}`,
      template: <MagicLinkEmail loginUrl={url} />,
    })
  },
},
```

Welcome email is sent after email verification completes (not on registration, since the email isn't verified yet).

### Billing Events (in Stripe plugin config)

```typescript
onSubscriptionComplete: async ({ subscription }) => {
  // Look up user, send PaymentConfirmation email
},

onSubscriptionCancel: async ({ subscription }) => {
  // Look up user, send SubscriptionCanceled email
},

onEvent: async (event) => {
  if (event.type === 'invoice.payment_failed') {
    // Look up user, send PaymentFailed email
  }
},
```

### Admin Invitation (in `src/features/admin/actions.ts`)

```typescript
// Inside inviteUser() server action
await sendEmail({
  to: email,
  subject: `You've been invited to ${APP_NAME}`,
  template: <UserInvitation inviterName={inviter.name} roleName={role.name} signUpUrl={signUpUrl} />,
})
```

### Contact Form (in `src/features/marketing/actions.ts`)

```typescript
// Inside submitContactForm() server action
await sendEmail({
  to: process.env.ADMIN_EMAIL ?? process.env.EMAIL_FROM!,
  subject: `New contact form message from ${name}`,
  template: <ContactFormEmail senderName={name} senderEmail={email} message={message} />,
  replyTo: email,
})
```

---

## Preview & Development

```bash
pnpm email:dev
```

Opens browser at `localhost:3001` with live preview of all templates. Each template has `PreviewProps` for sample data.

---

## Rules

- No external images in emails — all assets inline or served from the app URL
- Keep emails simple — not all email clients support advanced CSS
- Test rendering in major clients (Gmail, Outlook, Apple Mail) using React Email preview
- Configurable from address and app name via `.env` (`EMAIL_FROM`, `NEXT_PUBLIC_APP_NAME`)
- For development, use Resend's sandbox domain — no real emails sent