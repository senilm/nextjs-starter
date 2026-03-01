# BUILD ORDER

Step-by-step build sequence for ShipStation. Follow this order — each module depends on the ones before it. Never skip ahead.

---

## Rules

1. **One module at a time.** Complete, verify, and commit before moving to the next.
2. **Tell Claude Code which doc to read.** Start every prompt with: "Read `docs/XX-module.md` and implement..."
3. **Verify after every module.** Run the app, test the feature, check the boxes below. Don't proceed with failing checks.
4. **Commit after every module.** Clean commit with a message like: `feat: implement auth module (01)`. This gives you rollback points.
5. **Don't batch modules.** Claude Code does better with focused, sequential tasks.
6. **Fix before moving on.** If something breaks, fix it in the current module before starting the next one. Carrying bugs forward compounds problems.

---

## Phase 1: Foundation

### Module 00 — Project Setup
> Prompt: "Read `docs/00-project-setup.md` and set up the project."

- [ ] Next.js 16.1 initialized with TypeScript, Tailwind, ESLint, App Router, src dir
- [ ] Shadcn UI initialized (`pnpm dlx shadcn@latest init`)
- [ ] All core dependencies installed
- [ ] `tsconfig.json` strict mode overrides applied
- [ ] `.prettierrc` created
- [ ] `.env.example` with all variables documented
- [ ] `src/lib/env.ts` — Zod env validation works (app crashes with clear error on missing vars)
- [ ] `package.json` scripts all present
- [ ] Prisma schema created with all custom tables (Role, Permission, RolePermission, UserInvitation, Project, SystemSettings)
- [ ] `prisma migrate dev` runs without errors
- [ ] `prisma/seed.ts` created and idempotent (run twice, no duplicates)
- [ ] Seed creates: 18 permissions, 2 system roles, admin user, 3 plans, 5 sample projects, system settings
- [ ] `pnpm dev` starts without errors
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes

**Commit:** `feat: project setup and foundation (00)`

---

## Phase 2: Core Systems

### Module 01 — Authentication & Billing
> Prompt: "Read `docs/01-auth-and-billing.md` and implement authentication and billing."

- [ ] `src/lib/auth.ts` — Better Auth config with email/password, Google, GitHub, magic link, 2FA, Stripe plugin
- [ ] `src/lib/auth-client.ts` — Client-side auth with all plugins
- [ ] Better Auth CLI run — tables generated
- [ ] Auth pages created: sign-up, sign-in, forgot-password, reset-password, verify-email
- [ ] Auth layout: centered card, redirects if already authenticated
- [ ] Social buttons: Google + GitHub working, Apple/Discord/Twitter/LinkedIn/GitLab/Slack shown as UI-only
- [ ] Sign-up works: creates user, assigns default role, sends verification email
- [ ] Sign-in works: email/password, social login, magic link tab
- [ ] Forgot password works: sends reset email, reset page sets new password
- [ ] 2FA works: enable with QR code, verify with TOTP, backup codes shown
- [ ] Invite flow: `?invite=TOKEN` pre-fills email, assigns invited role
- [ ] Stripe plugin: customer created on signup, plans configured
- [ ] Billing API works: upgrade, cancel, restore, portal
- [ ] Webhook endpoint receives events at `/api/auth/stripe/webhook`
- [ ] Middleware: `/dashboard/*` requires auth, `/admin/*` requires auth + `admin.access`
- [ ] `pnpm dev` — can register, log in, log out
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes

**Commit:** `feat: auth and billing (01)`

---

### Module 02 — RBAC
> Prompt: "Read `docs/02-rbac.md` and implement the RBAC system."

- [ ] `Module` and `Action` enums in `src/lib/constants.ts`
- [ ] `perm()` helper function works
- [ ] `src/lib/rbac.ts` — `hasPermission()`, `hasPermissions()`, `getUserPermissions()`
- [ ] `src/hooks/use-permission.ts` — `usePermission()`, `usePermissions()`
- [ ] Session includes `permissions: string[]` array (loaded on login)
- [ ] Permission change invalidates session cache
- [ ] All enums used throughout (no raw permission strings anywhere)
- [ ] Verify: Super Admin user has all permissions in session
- [ ] Verify: Regular User has only projects.* and billing.manage
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes

**Commit:** `feat: RBAC system (02)`

---

## Phase 3: Features

### Module 03 — Dashboard
> Prompt: "Read `docs/03-dashboard.md` and build the user dashboard."

- [ ] Dashboard layout: sidebar (collapsible mobile), topbar with breadcrumbs
- [ ] Sidebar: nav links, Admin link gated by `admin.access`, plan badge, dark/light toggle, avatar dropdown
- [ ] Dashboard home: stats cards, quick actions, recent projects
- [ ] Account settings: profile form, change password, 2FA setup, active sessions, delete account
- [ ] Billing page: current plan card, usage progress bars, upgrade/cancel buttons, portal link
- [ ] Projects CRUD: list with pagination, sort, search, status filter
- [ ] Projects: create via dialog, edit via dialog, delete via alert dialog
- [ ] Projects: plan limit enforcement (upgrade prompt when limit reached)
- [ ] Projects: permission gating on all action buttons
- [ ] Projects: optimistic UI with TanStack Query
- [ ] All server actions follow the pattern: session → validate → permission → limits → execute → revalidate
- [ ] Toast notifications on all actions
- [ ] Empty states and loading skeletons
- [ ] Responsive at 375px, 768px, 1280px+
- [ ] Dark mode works on all dashboard pages
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes

**Commit:** `feat: dashboard, settings, billing, projects CRUD (03)`

---

### Module 04 — Admin Panel
> Prompt: "Read `docs/04-admin.md` and build the admin panel."

- [ ] Admin layout with permission-gated sidebar nav
- [ ] Admin dashboard: stats cards (users, subscriptions, MRR, signups)
- [ ] Admin dashboard: revenue chart, subscriptions chart, signups chart (Recharts)
- [ ] User management: table with search, role/plan/status filters, pagination, sorting
- [ ] User actions: view detail sheet, change role, suspend, unsuspend, delete
- [ ] Invite user: dialog with email + role selector, sends invitation email
- [ ] Roles management: list, create with permissions matrix, edit, delete (from `02-rbac.md`)
- [ ] Permissions matrix: checkboxes grouped by Module enum
- [ ] System roles: Super Admin fully locked, User role partially editable
- [ ] Delete role: blocked if users assigned, blocked if system role
- [ ] Plan management: view plans, edit display properties, active/inactive toggle
- [ ] System settings: site name, URL, support email, announcement banner, maintenance mode
- [ ] All server actions check specific permissions
- [ ] Responsive admin layout
- [ ] Dark mode works on all admin pages
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes

**Commit:** `feat: admin panel (04)`

---

## Phase 4: Public & Polish

### Module 05 — Landing Page & Marketing
> Prompt: "Read `docs/05-marketing.md` and build the marketing pages."

- [ ] Marketing layout: navbar (sticky, blur) + footer
- [ ] Navbar: auth button as client component, rest is server component
- [ ] Homepage: all 8 sections (hero, social proof, features, how-it-works, pricing, testimonials, FAQ, CTA)
- [ ] Interactive bits are isolated `'use client'` components (pricing toggle, FAQ accordion, mobile nav)
- [ ] Pricing page: monthly/yearly toggle, 3 plan cards, feature comparison table
- [ ] Blog: list page with cards, individual post pages from MDX
- [ ] Blog: syntax highlighting, TOC, anchor links, `generateStaticParams()`
- [ ] Contact page: form with honeypot, server action with rate limiting
- [ ] SEO: metadata on all pages, sitemap.xml, robots.txt
- [ ] JSON-LD: Organization on homepage, BlogPosting on posts
- [ ] Dynamic OG images for blog posts via `@vercel/og`
- [ ] Theme tokens in `globals.css` — buyer can rebrand from one file
- [ ] Font: Inter via `next/font` (self-hosted, no external request)
- [ ] `next build` — all marketing routes show `○ (Static)`
- [ ] Lighthouse 95+ on homepage
- [ ] Responsive at 375px, 768px, 1280px+
- [ ] Dark mode works on all marketing pages
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes

**Commit:** `feat: landing page and marketing (05)`

---

### Module 06 — Email System
> Prompt: "Read `docs/06-email.md` and build the email templates and integrations."

- [ ] Shared email layout component (header, footer, branding)
- [ ] All 9 templates created as React Email components
- [ ] All templates have `PreviewProps` for `npx email dev`
- [ ] `sendEmail()` helper in `src/features/email/send.ts`
- [ ] Auth events wired: verification, password reset, magic link
- [ ] Welcome email sent after email verification
- [ ] Invitation email sent from admin invite flow
- [ ] Billing events wired: payment confirmation, payment failed, cancellation
- [ ] Contact form email sends to admin
- [ ] `pnpm email:dev` opens preview at localhost:3001
- [ ] Templates render correctly in preview
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes

**Commit:** `feat: email system (06)`

---

## Phase 5: Ship

### Module 07 — Deployment
> Prompt: "Read `docs/07-deployment.md` and create the deployment configs."

- [ ] `next.config.ts` has `output: 'standalone'`
- [ ] `Dockerfile` — multi-stage, ~150MB final, non-root user
- [ ] `docker-compose.yml` — app + PostgreSQL with healthcheck
- [ ] `deploy.sh` — pull, build, up, migrate
- [ ] `nginx.conf.example` — reverse proxy with SSL
- [ ] `.dockerignore` — node_modules, .next, .env, .git
- [ ] Vercel deploy button in README
- [ ] `docker compose up` works locally
- [ ] Deploy to Vercel — app runs, auth works, Stripe works
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes

**Commit:** `feat: deployment configs (07)`

---

### Module 08 — CodeCanyon Submission
> Prompt: "Read `docs/08-codecanyon-submission.md` and run the full pre-submission checklist."

- [ ] **Full pre-submission checklist from `08-codecanyon-submission.md` passes** (code quality, functionality, compliance, performance, accessibility)
- [ ] README.md: quick start, tech stack, project structure, env vars, deployment
- [ ] CHANGELOG.md: version 1.0.0 entry
- [ ] PDF documentation created (30+ pages)
- [ ] Online documentation URL set up
- [ ] Video walkthrough recorded (10-15 min)
- [ ] Live demo deployed on Vercel with demo accounts
- [ ] Thumbnail (590×300px) created
- [ ] 8-12 screenshots captured
- [ ] Listing description written with tags
- [ ] Final `.zip` packaged with source + documentation + preview assets
- [ ] Submit to CodeCanyon

**Commit:** `chore: prepare codecanyon submission (08)`

---

## After Submission

Post-launch update plan (from PRD):

- **Week 2:** Blog comments (complex feature pattern)
- **Week 4:** Team/organization support (multi-tenancy lite)
- **Month 2:** API key management
- **Month 3:** Waitlist/pre-launch mode

Regular updates maintain CodeCanyon visibility and buyer confidence.