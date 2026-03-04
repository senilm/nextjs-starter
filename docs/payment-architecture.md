# Pluggable Payment Provider Architecture

## Context

Stripe requires an invite for production use in India. To use this starter kit for Indian-market projects, we need Razorpay support alongside Stripe. The solution: a provider-agnostic payment abstraction switchable via `PAYMENT_PROVIDER=stripe|razorpay` env var. One-time setup choice — choose before launch.

Key decisions:
- **Remove Better Auth Stripe plugin** — build fully custom implementations for both providers. Clean schema, full control, symmetric code.
- **Unified billing UI** — subscription management, cancel/resume, payment history built in-app for both providers. No reliance on Stripe's Customer Portal.
- **Proper schema relations** — Subscription has FK to Plan, provider-agnostic field names.
- **One subscription row per user** — always UPDATE, never INSERT new rows. Free plan = `provider: null`.
- **No past_due status** — payment fails = immediate downgrade to free. No grace period.
- **Payment table** — local record of every payment event for history + analytics.
- **Lazy customer creation** — provider customer created on first checkout, not on sign-up.
- **Incremental phases** — each independently testable and committable.

Full DB schema: `docs/db-schema.dbml` (paste into dbdiagram.io to visualize)

## Database Schema Changes

### User
- Remove: `stripeCustomerId`
- Add: `paymentCustomerId String?` — provider customer ID, set on first checkout

### Subscription (replaces current Stripe-specific model)
- One-to-one with User (`userId` is unique)
- Created on sign-up with free plan (`provider: null`)
- Always UPDATE on plan change, never create new rows
- Status: only `active` or `trialing` (no past_due/canceled/paused)

### Plan
- Add: `stripePriceId`, `stripeYearlyPriceId`, `razorpayPlanId`, `razorpayYearlyPlanId`
- Add: `subscriptions Subscription[]` relation

### Payment (NEW)
- Created by webhooks on every payment event
- FK to User, Subscription, AND Plan (snapshot of which plan was paid for)
- Tracks: provider, providerPaymentId, amount, currency, status, interval, invoiceUrl, paidAt
- `planId` captures which plan the payment was for — survives subscription updates
- `interval` captures monthly/yearly at time of payment
- Status: `succeeded | failed | refunded`
- This is your **full billing history** — query this to see what any user has paid for in the past

## Payment Flows

### Sign-up → Free Plan
1. Better Auth creates User
2. afterSignUp hook: INSERT Subscription with `planId: freePlan.id, provider: null, status: 'active'`
3. No provider API calls

### Upgrade (Free → Pro/Business)
1. User clicks "Upgrade" → server action `initiateCheckout({ planId, interval })`
2. If `user.paymentCustomerId` is null → create customer in provider → save to User
3. Look up Plan → get provider price ID
4. Stripe: `checkout.sessions.create()` → return redirect URL
5. Razorpay: `subscriptions.create()` → return modal config
6. Webhook fires on success → UPDATE Subscription with paid plan details → INSERT Payment record → send email

### Recurring Payment Success (webhook)
1. UPDATE Subscription `periodStart`/`periodEnd`
2. INSERT Payment record (`status: 'succeeded'`)
3. Send PaymentConfirmation email

### Payment Failure (webhook) — Immediate Downgrade
1. UPDATE Subscription back to free plan (`planId: freePlan.id, provider: null, all provider fields: null`)
2. INSERT Payment record (`status: 'failed'`)
3. Send PaymentFailed email with "Re-subscribe" CTA

### Cancel Subscription
1. Server action → provider API: cancel at period end
2. UPDATE Subscription: `cancelAtPeriodEnd: true`
3. Send SubscriptionCanceled email
4. When period ends (webhook) → UPDATE Subscription to free plan

### Resume Canceled (before period end)
1. Server action → provider API: undo cancel
2. UPDATE Subscription: `cancelAtPeriodEnd: false`

### Plan Change (Pro → Business)
1. Same as Upgrade flow — provider handles proration (Stripe) or cancel+recreate (Razorpay)
2. Webhook → UPDATE Subscription with new planId

### Trial Expires
- With card: provider charges → payment success webhook → stays on plan
- Without card: webhook → UPDATE Subscription to free plan → send TrialExpired email

## File Structure

```
src/lib/payment/
  types.ts                      — PaymentProvider interface + shared types
  index.ts                      — getPaymentProvider() factory
  helpers.ts                    — formatAmount(), provider-agnostic utilities
  webhook-processor.ts          — Shared webhook result → DB update + email logic
  providers/
    stripe.ts                   — Custom Stripe SDK implementation
    razorpay.ts                 — Custom Razorpay SDK implementation

src/features/billing/
  actions.ts                    — Server actions (getSubscription, initiateCheckout, cancelSubscription, etc.)
  hooks.ts                      — MODIFY: useSubscription() uses server actions, not authClient
  hooks/
    use-checkout.ts             — Provider-aware checkout hook
    use-payment-provider.ts     — Returns provider name for conditional UI
  types.ts                      — Billing-specific types
  components/
    billing-page.tsx            — MODIFY: add subscription management + payment history
    plan-card.tsx               — MODIFY: use provider-agnostic hooks
    usage-bars.tsx              — NO CHANGE
    subscription-details.tsx    — NEW: status, dates, cancel/resume actions
    payment-history.tsx         — NEW: payments from DB table
    razorpay-checkout-modal.tsx — NEW: Razorpay inline checkout (lazy-loaded)

src/app/api/webhooks/
  stripe/route.ts               — NEW: custom Stripe webhook endpoint
  razorpay/route.ts             — NEW: Razorpay webhook endpoint
```

## PaymentProvider Interface

```ts
interface PaymentProvider {
  readonly name: 'stripe' | 'razorpay'

  createCustomer(params: { userId: string; email: string; name: string }): Promise<string>

  createCheckout(params: {
    customerId: string
    planId: string
    interval: 'monthly' | 'yearly'
    successUrl: string
    cancelUrl: string
    trialDays?: number
    metadata: { userId: string; planId: string }
  }): Promise<CheckoutResult>

  cancelSubscription(providerSubscriptionId: string): Promise<void>

  resumeSubscription(providerSubscriptionId: string): Promise<void>

  getUpdatePaymentMethodUrl(params: {
    customerId: string
    returnUrl: string
  }): Promise<string | null>

  handleWebhook(request: Request): Promise<WebhookResult>
}

// Stripe redirects to hosted checkout, Razorpay opens inline modal
type CheckoutResult =
  | { type: 'redirect'; url: string }
  | { type: 'modal'; config: RazorpayModalConfig }

// Webhook processor uses this to UPDATE subscription + INSERT payment
interface WebhookResult {
  event: 'subscription.active' | 'subscription.renewed' | 'subscription.canceled' | 'payment.failed'
  providerSubscriptionId: string
  providerCustomerId: string
  providerPaymentId?: string
  planId?: string           // from metadata
  userId?: string           // from metadata
  interval?: 'monthly' | 'yearly'
  periodStart?: Date
  periodEnd?: Date
  amount?: number
  currency?: string
  invoiceUrl?: string | null
}
```

Note: `getInvoices()` removed from interface — payment history is served from our `payment` DB table, not provider API.

## Env Variables

```env
# Payment provider (one-time choice — set before launch)
PAYMENT_PROVIDER="stripe"  # or "razorpay"

# Stripe (required when PAYMENT_PROVIDER=stripe)
STRIPE_SECRET_KEY="sk_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Razorpay (required when PAYMENT_PROVIDER=razorpay)
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
NEXT_PUBLIC_RAZORPAY_KEY_ID=""
RAZORPAY_WEBHOOK_SECRET=""
```

Price/plan IDs now stored in the Plan DB table (not env vars) — admin can configure them.

## Implementation Phases

### Phase 1: Schema + Abstraction Layer
1. Remove `@better-auth/stripe` from `src/lib/auth.ts` and `src/lib/auth-client.ts`
2. Remove `@better-auth/stripe` package from dependencies
3. Update `prisma/schema.prisma`:
   - Subscription: replace entirely — `userId` (unique), `planId` FK, `provider`, `providerCustomerId`, `providerSubscriptionId`, status (`active`|`trialing` only), `interval`, period dates, `cancelAtPeriodEnd`, trial dates. Remove `referenceId`, `stripeCustomerId`, `stripeSubscriptionId`, `stripeScheduleId`, `seats`, `billingInterval`
   - User: rename `stripeCustomerId` → `paymentCustomerId`
   - Plan: add `stripePriceId`, `stripeYearlyPriceId`, `razorpayPlanId`, `razorpayYearlyPlanId`, add `subscriptions` relation
   - Payment (NEW): `userId` FK, `subscriptionId` FK, `provider`, `providerPaymentId`, `amount`, `currency`, `status`, `invoiceUrl`, `paidAt`
4. Run migration
5. Update seed: create free Subscription for each seeded user
6. Create `src/lib/payment/types.ts` — PaymentProvider interface + all shared types
7. Create `src/lib/payment/index.ts` — `getPaymentProvider()` factory
8. Create `src/lib/payment/helpers.ts` — `formatAmount()`, currency utils
9. Create `src/lib/payment/webhook-processor.ts` — shared logic: webhook result → UPDATE subscription + INSERT payment + send email
10. Update `src/lib/env.ts` — add `PAYMENT_PROVIDER` + conditional provider env vars
11. Update `.env.example`
12. Add Better Auth `afterSignUp` hook (or Prisma middleware) to create free Subscription on user creation

### Phase 2: Stripe Provider
13. Create `src/lib/payment/providers/stripe.ts`:
    - `createCustomer()` → `stripe.customers.create()`
    - `createCheckout()` → `stripe.checkout.sessions.create()` → redirect URL
    - `cancelSubscription()` → `stripe.subscriptions.update({ cancel_at_period_end: true })`
    - `resumeSubscription()` → `stripe.subscriptions.update({ cancel_at_period_end: false })`
    - `getUpdatePaymentMethodUrl()` → `stripe.billingPortal.sessions.create()`
    - `handleWebhook()` → verify signature, parse events, return `WebhookResult`
14. Create `src/app/api/webhooks/stripe/route.ts` → calls `handleWebhook()` + `processWebhookResult()`

### Phase 3: Billing Feature Refactor
15. Create `src/features/billing/actions.ts` — server actions: `getSubscription`, `initiateCheckout`, `cancelSubscription`, `resumeSubscription`, `getPaymentHistory`
16. Create `src/features/billing/types.ts`
17. Create `src/features/billing/hooks/use-checkout.ts` — provider-aware (redirect vs modal)
18. Create `src/features/billing/hooks/use-payment-provider.ts` — returns provider name
19. Update `src/features/billing/hooks.ts` — `useSubscription()` calls server action, not `authClient`
20. Create `src/features/billing/components/subscription-details.tsx` — status, dates, cancel/resume
21. Create `src/features/billing/components/payment-history.tsx` — payments from DB (not provider API)
22. Update `src/features/billing/components/plan-card.tsx` — provider-agnostic checkout
23. Update `src/features/billing/components/billing-page.tsx` — add subscription mgmt + payment history

### Phase 4: Razorpay Provider
24. Install `razorpay` npm package + `@types/razorpay` (if available)
25. Create `src/lib/payment/providers/razorpay.ts`:
    - `createCustomer()` → `razorpay.customers.create()`
    - `createCheckout()` → `razorpay.subscriptions.create()` → return modal config
    - `cancelSubscription()` → `razorpay.subscriptions.cancel({ cancel_at_cycle_end: 1 })`
    - `resumeSubscription()` → `razorpay.subscriptions.resume()`
    - `getUpdatePaymentMethodUrl()` → return `null` (Razorpay has no portal)
    - `handleWebhook()` → verify HMAC SHA256 + parse events
26. Create `src/app/api/webhooks/razorpay/route.ts`
27. Create `src/features/billing/components/razorpay-checkout-modal.tsx` (lazy-loaded)

### Phase 5: Polish + Peripheral Updates
28. Update marketing pricing page — CTA uses provider-aware checkout
29. Update `src/features/projects/actions.ts` — plan limit check: `subscription.plan.limits` via FK join
30. Update `src/features/admin/actions.ts` — MRR from `payment` table, subscriber counts from `subscription` + `plan` join
31. Update `src/features/admin/components/edit-plan-dialog.tsx` — add provider price ID fields
32. Update seed data with provider price IDs
33. Update sidebar plan badge to read from subscription → plan
34. Remove `PLANS` hardcoded config from `src/lib/config.ts` (replaced by Plan DB table)

## Key Files to Modify

| File | Change |
|------|--------|
| `prisma/schema.prisma` | New Subscription schema, Payment model, User rename, Plan relations |
| `src/lib/auth.ts` | Remove Better Auth Stripe plugin, add afterSignUp hook |
| `src/lib/auth-client.ts` | Remove stripeClient plugin |
| `src/lib/env.ts` | New env vars with conditional validation |
| `src/lib/config.ts` | Remove hardcoded plan pricing (moves to DB) |
| `src/features/billing/hooks.ts` | Use server actions instead of authClient |
| `src/features/billing/components/plan-card.tsx` | Provider-agnostic checkout |
| `src/features/billing/components/billing-page.tsx` | Add subscription mgmt + payment history |
| `src/features/projects/actions.ts` | Update plan limit check for new schema |
| `src/features/admin/actions.ts` | Update analytics queries — MRR from payment table |

## What Stays Unchanged

- Email templates — receive normalized data from webhook processor
- UI component library (Shadcn) — no changes
- Auth flows (sign-in, sign-up, etc.) — Better Auth core stays, only payment plugin removed
- RBAC system — completely independent

## Verification

1. `PAYMENT_PROVIDER=stripe` → Stripe checkout, webhooks, subscription management all work
2. `PAYMENT_PROVIDER=razorpay` → Razorpay checkout modal, webhooks, subscription management all work
3. Plan limits enforced correctly in both modes
4. Admin dashboard stats correct in both modes
5. Payment history displays in both modes
6. `pnpm tsc --noEmit` passes clean
