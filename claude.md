# CLAUDE.md — ShipStation

## Project

Next.js SaaS starter kit for CodeCanyon. Stack: Next.js 16.1, React 19, TypeScript 5.9, Tailwind CSS 4.2, Shadcn UI, Prisma 7.4, Better Auth 1.4, Stripe, Resend, Zod, TanStack Query. Node 22 LTS. pnpm only.

## Rules

- TypeScript strict mode. No `any`, no `@ts-ignore`, no `as unknown as X`. Explicit return types on all functions.
- No file over 300 lines — split into components, utils, or hooks.
- Every file starts with a JSDoc header: `@file`, `@module`, one-line purpose.
- No inline styles. Tailwind utilities or CSS modules only.
- No CDN URLs. All libraries installed via pnpm and bundled.
- No `console.log` in production code. No TODO/FIXME comments in committed code.
- No hardcoded strings. Use constants, config, or env vars.
- Soft deletes everywhere — every deletable model has `deletedAt: DateTime?`. Prisma middleware filters globally.
- Server-first security — every mutation checks permissions server-side via `hasPermission()`. Client checks are cosmetic.
- All user input validated with Zod on both client and server.
- Imports ordered: React/Next → external packages → `@/lib` → `@/features` → `@/components` → `@/hooks` → `@/types`.
- Use github mcp to perform github related actions

## Naming

- Files/folders: `kebab-case` → `user-settings.tsx`
- Components: `PascalCase` → `UserSettings`
- Functions/variables: `camelCase` → `getUserById`
- Constants: `UPPER_SNAKE_CASE` → `MAX_PROJECTS_FREE`
- Types/interfaces: `PascalCase` → `UserWithRole`
- Permissions: `module.action` → `users.view`, `billing.manage`
- DB tables: `camelCase` singular via `@@map`

## Structure

```
src/app/                        — Routing only (thin files, import from features)
  (marketing)/                  — public: /, /pricing, /blog, /contact
  (auth)/                       — auth: /sign-in, /sign-up, /forgot-password, etc.
  (dashboard)/                  — user area: /dashboard/*
  (admin)/                      — admin: /admin/*
src/features/                   — Feature logic (the meat of the app)
  auth/                         — components, actions, validations
  projects/                     — components, actions, hooks, validations, types
  billing/                      — components, actions, hooks
  admin/                        — components, actions (admin dashboard, users, settings)
  roles/                        — components, actions, validations (RBAC management)
  settings/                     — components, actions, validations (system settings)
  marketing/                    — components (landing sections, pricing, contact)
  email/                        — templates, send helper
src/components/
  ui/                           — Shadcn primitives (don't edit)
  layouts/                      — Sidebar, topbar, breadcrumbs
  shared/                       — Reusable across features
src/lib/                        — Cross-cutting: auth, auth-client, prisma, rbac, env, utils, config, constants
src/hooks/                      — Shared hooks (usePermission, useDebounce)
src/types/                      — Shared global types
prisma/                         — Schema, migrations, seed
emails/                         — React Email templates (referenced by features/email)
```

**Rule:** `src/app/` pages are thin — they import and render feature components. All logic, state, and data fetching lives in `src/features/`.

## Patterns

**Server actions** — live in `src/features/<feature>/actions.ts`. Every action follows: get session → validate input (Zod) → check permission → check plan limits (if creation) → execute → revalidate.

**Components** — feature-specific components live in `src/features/<feature>/components/`. Shared components in `src/components/shared/`. Props via interface, permission-gated actions use `usePermission()` hook.

**RBAC** — `hasPermission(userId, 'module.action')` server-side. `usePermission('module.action')` client-side. Session includes `permissions: string[]` array.

**Forms** — Zod schema in `src/features/<feature>/validations.ts`, shared between react-hook-form and server action.

**Data fetching** — TanStack Query for reads, server actions for writes, optimistic updates on mutations.

## CodeCanyon Compliance

Before any PR: no CDN URLs, no inline styles, no `console.log`, no `any` types, no GPL dependencies (`npx license-checker --summary`), all files have headers, `.env.example` documents every variable, responsive at 375/768/1280px, dark mode works everywhere, Lighthouse 95+ on marketing pages.

## Component Reference

Before building any UI component, check `/Users/senilmendapara/Documents/react-dashboard-starter` for existing Shadcn + Framer Motion patterns. If a matching component exists there, use it as the baseline — match its animation style, easing curves, and motion structure. Adapt it for ShipStation's needs.

If no matching component exists in that repo, create new animations using the `motion` package (Framer Motion) that feel consistent with the existing ones. Every interactive component should have subtle, purposeful motion — entrances, hover states, layout transitions. Keep it tasteful: short durations (150–300ms), gentle easing (`easeOut`, spring with low bounce), no gratuitous movement. The goal is polished, not flashy.

## Key Docs

PRD lives at `docs/PRD.md`. Module-specific implementation docs will be added to `docs/` as we build. When implementing a module, reference the PRD section for exact specs (auth flows, RBAC permissions table, billing plans, admin pages, email templates, etc.).

Development flow is mentioned in the `docs/BUILD-ORDER.md`