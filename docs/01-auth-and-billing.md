# Module 01: Authentication & Billing (Better Auth + Stripe Plugin)

Everything goes through Better Auth — auth, social login, 2FA, sessions, AND Stripe billing. One config file, one system.

- **Better Auth:** `1.4.x` (latest)
- **Stripe Plugin:** `@better-auth/stripe` (latest)
- **Stripe SDK:** `stripe@^18.0.0`

---

## Single Config File

Location: `src/lib/auth.ts` — this is the **only** file where auth + billing are configured.

```typescript
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { stripe } from '@better-auth/stripe'
import { twoFactor, magicLink } from 'better-auth/plugins'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },

  plugins: [
    twoFactor({ issuer: process.env.NEXT_PUBLIC_APP_NAME }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        // Send via Resend — see email module
      },
    }),
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      createCustomerOnSignUp: true,
      subscription: {
        enabled: true,
        plans: [
          {
            name: 'free',
            limits: { projects: 3, storage: 1 },
          },
          {
            name: 'pro',
            priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
            annualDiscountPriceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID!,
            limits: { projects: 25, storage: 10 },
            freeTrial: { days: 14 },
          },
          {
            name: 'business',
            priceId: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID!,
            annualDiscountPriceId: process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID!,
            limits: { projects: 100, storage: 50 },
          },
        ],
        onSubscriptionComplete: async ({ subscription }) => {
          // Send payment confirmation email
        },
        onSubscriptionUpdate: async ({ subscription }) => {
          // Handle plan change
        },
        onSubscriptionCancel: async ({ subscription }) => {
          // Send cancellation email
        },
      },
    }),
  ],

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      // Send via Resend — see email module
    },
  },

  user: {
    changeEmail: { enabled: true },
  },
})
```

Location: `src/lib/auth-client.ts`

```typescript
import { createAuthClient } from 'better-auth/react'
import { stripeClient } from '@better-auth/stripe/client'
import { twoFactorClient } from 'better-auth/plugins/two-factor/client'
import { magicLinkClient } from 'better-auth/plugins/magic-link/client'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [
    stripeClient({ subscription: true }),
    twoFactorClient(),
    magicLinkClient(),
  ],
})

export const { useSession, signIn, signUp, signOut } = authClient
```

---

## Auth Features

### Integrated (Working)

| Feature | Implementation |
|---|---|
| Email + password | Better Auth built-in, Zod validation (min 8 chars, upper + lower + number) |
| Email verification | Better Auth + Resend template (24h expiry) |
| Google OAuth | Better Auth `socialProviders.google` |
| GitHub OAuth | Better Auth `socialProviders.github` |
| Magic link | Better Auth magic link plugin + Resend (15min expiry, single-use) |
| Forgot password | Better Auth + Resend template (1h expiry) |
| 2FA (TOTP) | Better Auth two-factor plugin, QR code setup, 8 hashed backup codes |
| Session management | DB-backed, HTTP-only SameSite=Lax cookies, 7-day expiry |
| Account settings | Name, email (re-verify), avatar, password, 2FA, active sessions |
| Account deletion | Soft-delete with 7-day grace period |

### UI-Only (Shown but Not Wired)

Show these as provider buttons on the sign-in/sign-up pages. They're visually present but disabled/greyed with a tooltip: "Enable in .env — see docs". This demonstrates extensibility.

- Apple
- Discord
- Twitter/X
- LinkedIn
- GitLab
- Slack

Each one is a one-line config addition + env key. Document how to enable them in the PDF manual.

---

## Auth Pages

```
src/app/(auth)/
├── sign-up/page.tsx          — Thin: imports SignUpForm from features/auth
├── sign-in/page.tsx          — Thin: imports SignInForm from features/auth
├── forgot-password/page.tsx  — Thin: imports ForgotPasswordForm from features/auth
├── reset-password/page.tsx   — Thin: imports ResetPasswordForm from features/auth
├── verify-email/page.tsx     — Thin: imports VerifyEmail from features/auth
└── layout.tsx                — Centered card layout, redirect if authed

src/features/auth/
├── components/
│   ├── sign-up-form.tsx
│   ├── sign-in-form.tsx
│   ├── forgot-password-form.tsx
│   ├── reset-password-form.tsx
│   ├── verify-email.tsx
│   ├── social-buttons.tsx    — Google, GitHub (working) + UI-only providers
│   └── magic-link-form.tsx
├── actions.ts                — Server actions (register, login, reset, invite)
└── validations.ts            — Zod schemas (sign-up, sign-in, reset)
```

### Layout Rules

- Minimal centered card, no sidebar, no nav
- Redirect to `/dashboard` if already authenticated
- App logo at top
- Social buttons (working + UI-only) always visible on sign-in and sign-up
- Links between pages: sign-up ↔ sign-in, forgot-password from sign-in

### Sign-Up (`/sign-up`)

- Fields: Name, Email, Password
- Social buttons: Google, GitHub (working), then Apple, Discord, etc. (UI-only, greyed)
- Zod: name 2-50 chars, valid email, password min 8 + upper + lower + number
- On success: assign default role (`isDefault = true`), redirect to `/verify-email`
- If `?invite=TOKEN`: pre-fill email, assign invited role instead of default
- Inline validation errors, disabled submit while loading

### Sign-In (`/sign-in`)

- Two tabs: Email/Password and Magic Link
- Social buttons same as sign-up
- "Remember me" extends session to 30 days
- If 2FA enabled on account: TOTP input after password success
- On success: redirect to `/dashboard`

### Forgot Password (`/forgot-password`)

- Email input only
- Always shows success regardless of whether email exists (prevent enumeration)
- Sends reset link via Resend (1h expiry, hashed token, single-use)

### Verify Email (`/verify-email`)

- Shown after registration
- Auto-checks verification status on interval
- Resend button with 60-second cooldown

---

## User Creation Flows

### Self-Registration

```
/sign-up → create user with default role → send verification email → /verify-email → click link → emailVerified = true → /dashboard
```

### Admin Invitation

```
Admin: /admin/users → "Invite User" → enter email + select role → create UserInvitation with token → send invite email
Invitee: clicks link → /sign-up?invite=TOKEN → pre-filled email → complete registration → assigned invited role (NOT default) → mark invitation accepted → /verify-email → /dashboard
```

---

## Billing

### Plans

| Plan | Monthly | Yearly | Trial | Projects | Storage |
|---|---|---|---|---|---|
| Free | $0 | — | — | 3 | 1 GB |
| Pro | $19/mo | $190/yr | 14 days | 25 | 10 GB |
| Business | $49/mo | $490/yr | — | 100 | 50 GB |

### Plan Config (Single Source of Truth)

Location: `src/lib/config.ts` — shared between pricing page, billing page, and plugin config.

```typescript
export const PLANS = {
  free: {
    name: 'Free',
    description: 'Perfect for trying things out',
    monthlyPrice: 0,
    yearlyPrice: 0,
    limits: { projects: 3, storage: 1 },
    features: ['3 projects', '1 GB storage', 'Community support', 'Basic analytics'],
  },
  pro: {
    name: 'Pro',
    description: 'For serious builders',
    monthlyPrice: 19,
    yearlyPrice: 190,
    badge: 'Popular',
    limits: { projects: 25, storage: 10 },
    features: ['25 projects', '10 GB storage', 'Priority support', 'Advanced analytics', 'Custom domain', 'API access'],
  },
  business: {
    name: 'Business',
    description: 'For teams and agencies',
    monthlyPrice: 49,
    yearlyPrice: 490,
    limits: { projects: 100, storage: 50 },
    features: ['100 projects', '50 GB storage', 'Dedicated support', 'Full analytics suite', 'Custom domain', 'API access', 'Team management', 'White-label option'],
  },
} as const
```

### Client-Side Billing API

All billing operations go through the Better Auth client:

```typescript
// Upgrade / subscribe
authClient.subscription.upgrade({
  plan: 'pro',
  successUrl: '/dashboard/billing?success=true',
  cancelUrl: '/dashboard/billing?canceled=true',
})

// Switch plan
authClient.subscription.upgrade({
  plan: 'business',
  subscriptionId: 'sub_123', // existing subscription
  successUrl: '/dashboard/billing?upgraded=true',
  cancelUrl: '/dashboard/billing',
})

// Cancel
authClient.subscription.cancel({ returnUrl: '/dashboard/billing' })

// Restore (canceled but not ended)
authClient.subscription.restore({ subscriptionId: 'sub_123' })

// Billing portal (payment methods, invoices)
authClient.subscription.billingPortal({ returnUrl: '/dashboard/billing' })

// List subscriptions
const subs = await authClient.subscription.list()
```

### Usage Enforcement

Server-side check before any resource creation:

```typescript
export async function canCreateProject(userId: string) {
  const subscriptions = await auth.api.listActiveSubscriptions({ userId })
  const activePlan = subscriptions?.[0]?.plan ?? 'free'
  const limit = PLANS[activePlan as keyof typeof PLANS]?.limits.projects ?? 3
  const current = await prisma.project.count({ where: { userId, deletedAt: null } })
  return { allowed: current < limit, current, limit }
}
```

If limit reached: return error with upgrade prompt. No resource created.

### Webhook Handling

The plugin auto-handles at `/api/auth/stripe/webhook`:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

This route MUST be excluded from auth middleware and CSRF protection. Body parsed as raw for signature verification.

### Trial Abuse Prevention

Handled automatically by the plugin — one trial per user across all plans. No custom code needed.

---

## Database Schema

### Better Auth Managed Tables

Better Auth generates and manages its own tables (user, session, account, verification). Run the CLI to generate the Prisma schema additions:

```bash
npx @better-auth/cli generate  # generates schema additions for Prisma
npx @better-auth/cli migrate    # applies directly if using Kysely adapter
```

This creates: `user`, `session`, `account`, `verification` tables and the `subscription` table from the Stripe plugin. **Do not manually define these in `schema.prisma`** — the CLI handles it.

### Extending the User Table

Better Auth allows extending the user model with custom fields. Add our fields (`roleId`, `isActive`, `deletedAt`) via the Better Auth config's `user.additionalFields` or by adding them to the generated schema after running the CLI. The key custom fields we need on user:

- `roleId` (FK to our roles table)
- `isActive` (boolean, default true)
- `deletedAt` (nullable DateTime for soft delete)

### Our Custom Tables (in `schema.prisma`)

These are NOT managed by Better Auth — we define and own them:

```prisma
model UserInvitation {
  id        String   @id @default(cuid())
  email     String
  roleId    String
  invitedBy String
  token     String   @unique
  status    String   @default("pending") // pending | accepted | expired
  expiresAt DateTime
  createdAt DateTime @default(now())
  @@map("user_invitations")
}
```

RBAC tables (`Role`, `Permission`, `RolePermission`), `Project`, and `SystemSettings` are covered in their respective module docs.

---

## Session Shape

The session returned by `auth.api.getSession()` and `useSession()` must include the user's permissions for client-side UI gating. Extend the session via Better Auth hooks to include:

```typescript
{
  user: {
    id: string
    name: string
    email: string
    image: string | null
    role: { id: string, name: string }
    permissions: string[]  // ['projects.view', 'billing.manage', ...]
    stripeCustomerId: string | null
  }
}
```

Permissions loaded on login by joining user → role → rolePermissions → permissions. Server actions always re-check from DB.

---

## Security

- Passwords: bcrypt cost factor 12. Never stored or logged in plain text.
- Sessions: secure HTTP-only SameSite=Lax cookies. DB-backed, revocable.
- 2FA secrets: encrypted AES-256 at rest. Backup codes stored hashed.
- Reset tokens: hashed in DB, 1h expiry, single-use.
- Magic link tokens: single-use, 15min expiry.
- OAuth: state parameter validation to prevent CSRF.
- Email enumeration prevention: forgot-password always shows success.
- Rate limiting: 5 auth attempts per 15 minutes per IP.
- Stripe webhooks: signature verification via `stripeWebhookSecret`. Rejects tampered payloads.
- No credit card data touches our server — all via Stripe hosted Checkout/Portal.
- Subscription status synced via webhooks only — client cannot self-report payment status.

---

## Middleware

Location: `src/middleware.ts`

- `/dashboard/*` → requires authentication, redirect to `/sign-in` if not
- `/admin/*` → requires authentication + `admin.access` permission
- `/api/auth/*` → public (Better Auth endpoints)
- `/api/auth/stripe/webhook` → public, no CSRF, raw body
- Marketing pages → public, no auth check
- Auth pages → redirect to `/dashboard` if already authenticated