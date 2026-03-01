# Module 00: Project Setup & Developer Experience

## Tech Stack (Locked Versions)

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.1 |
| UI Library | React | 19 |
| Language | TypeScript | 5.9 |
| Styling | Tailwind CSS + Shadcn UI | 4.2 |
| Auth | Better Auth | 1.4 |
| ORM | Prisma | 7.4 |
| Database | PostgreSQL (default) | 16+ |
| Payments | Stripe via @better-auth/stripe | Latest SDK |
| Email | Resend + React Email | 6.9 |
| Validation | Zod | 3.x |
| Data Fetching | TanStack Query | 5.x |
| Icons | Lucide React | Latest |
| Runtime | Node.js | 22 LTS |

Pin exact major.minor in `package.json`. Document any version bump in `CHANGELOG.md`.

Database flexibility: Prisma 7 supports PostgreSQL (default), MySQL, and SQLite. Buyer switches by changing `DATABASE_URL` in `.env` and the `provider` in `schema.prisma`. No other code changes needed.

---

## Project Initialization

```bash
pnpm create next-app@latest shipstation --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### Shadcn UI Init

```bash
pnpm dlx shadcn@latest init
```

This sets up Tailwind, Radix primitives, `cn()` utility, Lucide icons, and the `src/components/ui/` directory. Add components as needed with `pnpm dlx shadcn@latest add button card dialog` etc.

> **Reminder:** The `CLAUDE.md` Component Reference section applies here. When adding any Shadcn component, check `/Users/senilmendapara/Documents/react-dashboard-starter` first for an animated version. If one exists, use it. If not, add subtle `motion` animations (entrances, hover states, layout transitions — 150–300ms, gentle easing).

### Core Dependencies

```bash
# Animation
pnpm add motion

# Auth
pnpm add better-auth @better-auth/stripe

# Database
pnpm add @prisma/client
pnpm add -D prisma

# Forms & Validation
pnpm add zod react-hook-form @hookform/resolvers

# Data Fetching
pnpm add @tanstack/react-query

# Email
pnpm add resend @react-email/components

# Payments
pnpm add stripe

# Utilities
pnpm add date-fns nanoid
```

### Dev Dependencies

```bash
pnpm add -D @types/node @types/react @types/react-dom
pnpm add -D prettier eslint-config-prettier prettier-plugin-tailwindcss
pnpm add -D @next/bundle-analyzer
```

---

## Configuration

### tsconfig.json Overrides

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### .prettierrc

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### ESLint

Extend `next/core-web-vitals` and `next/typescript`. Zero warnings policy — treat warnings as errors in CI.

---

## Path Aliases

All imports use `@/` prefix. Never use relative paths that go more than one level up.

```
@/components  → src/components
@/features    → src/features
@/lib         → src/lib
@/hooks       → src/hooks
@/types       → src/types
```

---

## Environment Variables

### .env.example

Every variable has a comment explaining what it is, where to get it, and the expected format.

```bash
# ──────────────────────────────────────
# DATABASE
# ──────────────────────────────────────
# PostgreSQL connection string
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
# Get from: Neon (neon.tech), Supabase, or local PostgreSQL
# For MySQL: mysql://USER:PASSWORD@HOST:PORT/DATABASE
# For SQLite: file:./dev.db
DATABASE_URL="postgresql://postgres:password@localhost:5432/shipstation"

# ──────────────────────────────────────
# AUTHENTICATION (Better Auth)
# ──────────────────────────────────────
# Random secret for signing tokens (min 32 chars)
# Generate: openssl rand -base64 32
BETTER_AUTH_SECRET=""

# App base URL (no trailing slash)
BETTER_AUTH_URL="http://localhost:3000"

# ──────────────────────────────────────
# OAUTH PROVIDERS
# ──────────────────────────────────────
# Google — https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# GitHub — https://github.com/settings/developers
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# ──────────────────────────────────────
# STRIPE
# ──────────────────────────────────────
# Dashboard: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Webhook secret — https://dashboard.stripe.com/webhooks
# Local dev: stripe listen --forward-to localhost:3000/api/auth/stripe/webhook
STRIPE_WEBHOOK_SECRET="whsec_..."

# Stripe Price IDs (create in Stripe Dashboard → Products)
STRIPE_PRO_MONTHLY_PRICE_ID=""
STRIPE_PRO_YEARLY_PRICE_ID=""
STRIPE_BUSINESS_MONTHLY_PRICE_ID=""
STRIPE_BUSINESS_YEARLY_PRICE_ID=""

# ──────────────────────────────────────
# EMAIL (Resend)
# ──────────────────────────────────────
# Get from: https://resend.com/api-keys
RESEND_API_KEY="re_..."

# Sender address (must be verified domain in Resend)
EMAIL_FROM="ShipStation <noreply@yourdomain.com>"

# ──────────────────────────────────────
# FILE UPLOADS (UploadThing)
# ──────────────────────────────────────
# Get from: https://uploadthing.com/dashboard
UPLOADTHING_SECRET=""
UPLOADTHING_APP_ID=""

# ──────────────────────────────────────
# APP CONFIG
# ──────────────────────────────────────
# Public-facing app URL (used in emails, OG images, etc.)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# App display name
NEXT_PUBLIC_APP_NAME="ShipStation"
```

### Zod Env Validation

Location: `src/lib/env.ts`

Validates all required env vars at app startup. Missing or invalid variables produce clear error messages telling the buyer exactly what's wrong and where to get the value. Import this early so the app fails fast on misconfiguration.

```typescript
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid connection string'),
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters. Generate with: openssl rand -base64 32'),
  BETTER_AUTH_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'STRIPE_SECRET_KEY must start with sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  RESEND_API_KEY: z.string().startsWith('re_', 'RESEND_API_KEY must start with re_'),
  EMAIL_FROM: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
  // OAuth — optional (app works without social login)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  // Stripe price IDs — optional for dev (required for billing to work)
  STRIPE_PRO_MONTHLY_PRICE_ID: z.string().optional(),
  STRIPE_PRO_YEARLY_PRICE_ID: z.string().optional(),
  STRIPE_BUSINESS_MONTHLY_PRICE_ID: z.string().optional(),
  STRIPE_BUSINESS_YEARLY_PRICE_ID: z.string().optional(),
  // UploadThing — optional
  UPLOADTHING_SECRET: z.string().optional(),
  UPLOADTHING_APP_ID: z.string().optional(),
})

export const env = envSchema.parse(process.env)
```

---

## Scripts

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:migrate:prod": "prisma migrate deploy",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "email:dev": "email dev",
    "postinstall": "prisma generate"
  }
}
```

---

## One-Command Setup: `npx shipstation init`

CLI script at `scripts/init.ts`. Interactive setup that walks the buyer through configuration.

### Flow

1. Print welcome banner with ShipStation logo/name
2. Prompt for DATABASE_URL (with default: `postgresql://postgres:password@localhost:5432/shipstation`)
3. Prompt for BETTER_AUTH_SECRET (offer to auto-generate with `crypto.randomBytes(32)`)
4. Prompt for Stripe keys (sk_test, pk_test, whsec — allow skipping for initial setup)
5. Prompt for Resend API key (allow skipping)
6. Prompt for OAuth keys (allow skipping)
7. Write `.env` from `.env.example` template with filled values
8. Run `pnpm install`
9. Run `prisma migrate dev` (creates all tables)
10. Run `prisma db seed` (seeds default data)
11. Print success message:
    - Login credentials: `admin@shipstation.dev` / `Admin@123456`
    - Run `pnpm dev` to start
    - Links to documentation

### Rules

- Skipped values get sensible defaults or empty strings with a note to fill later
- Never crash on a skipped optional value — the app should boot with just DATABASE_URL and BETTER_AUTH_SECRET at minimum
- Use clear prompts with examples for every input
- Colorized output (green for success, yellow for skipped, red for errors)

---

## Seed Script

Location: `prisma/seed.ts`

Must be **idempotent** — running it twice does not create duplicates. Use `upsert` for everything.

### What It Creates

1. **All permissions** (18 default `module.action` pairs from PRD)
   - admin.access, users.view, users.create, users.edit, users.delete
   - roles.view, roles.create, roles.edit, roles.delete
   - plans.view, plans.edit
   - settings.view, settings.edit
   - projects.view, projects.create, projects.edit, projects.delete
   - billing.manage

2. **Super Admin role** — `isSystem: true`, `isDefault: false`, all 18 permissions assigned

3. **User role** — `isSystem: true`, `isDefault: true`, permissions: projects.view, projects.create, projects.edit, projects.delete, billing.manage

4. **Super Admin user**
   - Email: `admin@shipstation.dev`
   - Password: `Admin@123456` (hashed with bcrypt, cost 12)
   - Role: Super Admin
   - emailVerified: true

5. **3 subscription plans** (display config, not Stripe products)
   - Free: 3 projects, 1 GB storage
   - Pro: $19/mo, $190/yr, 25 projects, 10 GB, 14-day trial
   - Business: $49/mo, $490/yr, 100 projects, 50 GB

6. **5 sample projects** assigned to Super Admin for demo

7. **System settings** — default site name, URL, support email

### Seed Output

Print a summary after seeding:
```
✓ 18 permissions created
✓ 2 system roles created (Super Admin, User)
✓ 1 admin user created (admin@shipstation.dev)
✓ 3 plans configured
✓ 5 sample projects created
✓ System settings initialized
```