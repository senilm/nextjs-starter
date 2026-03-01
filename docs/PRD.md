**PRODUCT REQUIREMENTS DOCUMENT**

**ShipStation**

Next.js SaaS Starter Kit & Boilerplate – Product Requirements Document

February 2026

Version 1.0 | Confidential

Table of Contents

Executive Summary

ShipStation is a production-ready Next.js SaaS boilerplate that gives developers and entrepreneurs everything they need to launch a SaaS product in days instead of months. It includes authentication, role-based access control with granular permissions, subscription billing, admin dashboard, email system, an SEO-optimized landing page, a working CRUD example, and comprehensive documentation.

The CodeCanyon boilerplate/starter kit category has fewer than 20 competing products, most built on outdated stacks (Laravel + Bootstrap 4, Next.js 14 with Appwrite). Outside CodeCanyon, similar products such as MakerKit, Supastarter, and ShipFast sell for $199–$399. At our $49 price point on CodeCanyon, ShipStation offers exceptional value while addressing the #1 buyer complaint on the platform: outdated, broken code with poor documentation.

Competitive Positioning

|                        |                             |           |                                                         |
|------------------------|-----------------------------|-----------|---------------------------------------------------------|
| **Competitor**         | **Stack**                   | **Price** | **Weakness We Exploit**                                 |
| SaasPilot (CC)         | Next.js 15 + Prisma 6       | $49      | Already one version behind on Next.js & Prisma, no RBAC |
| 31SaaS (CC)            | Next.js 14 + Appwrite       | $39      | Appwrite lock-in, two versions behind, hardcoded roles  |
| Saasify (CC)           | Laravel 9 + Bootstrap 4     | $79      | Completely outdated, no updates since 2022              |
| MakerKit               | Next.js + Supabase          | $299     | 5x our price, not on CodeCanyon                         |
| Supastarter            | Next.js + Supabase          | $249     | 5x our price, not on CodeCanyon                         |
| **ShipStation (Ours)** | **Next.js 16.1 + Prisma 7** | **$49**  | **Latest stack, RBAC, self-hosted auth, best docs**     |

Key Differentiators

- Latest 2026 stack: Next.js 16.1, React 19, TypeScript 5.9, Tailwind CSS 4.2, Prisma 7.4, Better Auth 1.4 — nothing outdated.


- Database-driven RBAC: permissions, roles, and role_permissions tables — not hardcoded. Buyers create custom roles from the admin panel. Module-level + action-level granularity (e.g., users.view, users.delete, billing.manage).


- Self-hosted auth via Better Auth: no Clerk or Auth0 dependency, no per-user pricing. The buyer owns their auth completely.


- CodeCanyon-grade documentation: PDF manual, video walkthrough, inline code comments, and one-command setup.


- Beautiful, customizable UI: a polished landing page with Shadcn UI components, dark/light mode, and a cohesive design system the buyer adapts by editing a single config file.


- Database flexibility: Prisma 7 ORM supports PostgreSQL (default), MySQL, and SQLite. Switch with one env variable.

Target Audience

- **Indie hackers & solo founders:** Want to validate a SaaS idea fast without spending 2 months on boilerplate. Need auth, payments, and a dashboard working on day one.


- **Freelancers & agencies:** Start client SaaS projects faster. Reuse the kit across multiple client builds. Extended license ($249) allows multi-client use.


- **Developers learning Next.js:** Well-documented, clean codebase serves as a learning resource. Real-world patterns for auth, RBAC, payments, and role-based access.


- **Non-technical founders with AI coding tools:** Clean structure works well with Cursor, Copilot, and Claude Code. The organized codebase is easy for AI tools to extend.

Tech Stack

All technologies locked to their latest stable versions as of March 2026:

|                   |                                |             |                                                                    |
|-------------------|--------------------------------|-------------|--------------------------------------------------------------------|
| **Layer**         | **Technology**                 | **Version** | **Why This Choice**                                                |
| **Framework**     | Next.js (App Router)           | 16.1        | Latest stable. Turbopack caching, React 19 support.                |
| **UI Library**    | React                          | 19          | Server Components, Actions, use() hook.                            |
| **Language**      | TypeScript                     | 5.9         | Latest stable. 6.0 is beta only — we ship stable.                  |
| **Styling**       | Tailwind CSS + Shadcn UI       | 4.2         | No config file needed in v4. Shadcn is copy-paste, no lock-in.     |
| **Auth**          | Better Auth                    | 1.4         | Self-hosted, open-source. No per-user cost. Social + email + 2FA.  |
| **Database ORM**  | Prisma                         | 7.4         | Pure-TS engine (Rust-free). Faster, lighter. Type-safe queries.    |
| **Database**      | PostgreSQL                     | 16+         | Production standard. Neon or Supabase for managed hosting.         |
| **Payments**      | Stripe via @better-auth/stripe | Latest SDK  | Official plugin. Checkout, Portal, webhooks handled by auth layer. |
| **Email**         | Resend + React Email           | 6.9         | Modern API. React-based templates. Free tier: 3k emails/mo.        |
| **Validation**    | Zod                            | 3.x         | Runtime + compile-time validation. Works with forms and API.       |
| **Data Fetching** | TanStack Query                 | 5.x         | Cache management, optimistic updates, server state.                |
| **Icons**         | Lucide React                   | Latest      | 1400+ icons. Tree-shakeable. Consistent style.                     |
| **Runtime**       | Node.js                        | 22 LTS      | 2026 baseline. Required for Next.js 16.                            |
| **Deployment**    | Vercel + Docker                | —           | One-click Vercel deploy. Docker for self-hosted VPS.               |

Module 1: Project Structure & Developer Experience

1.1 Directory Structure (Top-Level)

Clean, predictable folder layout. Detailed file-level decisions will be made during implementation:

- src/app/ — Next.js App Router pages and layouts, organized into route groups: (marketing), (auth), (dashboard), (admin).


- src/components/ — Shared UI components. Includes src/components/ui/ for Shadcn UI primitives.


- src/lib/ — Utility functions, auth config, Stripe helpers, email helpers, RBAC helpers, constants.


- src/server/ — Server actions, API helpers, database query functions.


- src/hooks/ — Custom React hooks.


- src/types/ — Shared TypeScript types and interfaces.


- prisma/ — Schema file, migrations, and seed script.


- emails/ — React Email templates.


- public/ — Static assets, favicon, OG images.

1.2 Route Groups

|                 |                                                                          |                                                                      |
|-----------------|--------------------------------------------------------------------------|----------------------------------------------------------------------|
| **Route Group** | **URL Pattern**                                                          | **Purpose**                                                          |
| **(marketing)** | / , /pricing, /blog, /contact                                            | Public pages. No auth required. SEO optimized, statically generated. |
| **(auth)**      | /sign-in, /sign-up, /forgot-password, /verify-email                      | Auth flows. Minimal layout. Redirects if already logged in.          |
| **(dashboard)** | /dashboard, /dashboard/settings, /dashboard/billing, /dashboard/projects | Protected user area. Sidebar layout. Requires authentication.        |
| **(admin)**     | /admin, /admin/users, /admin/roles, /admin/plans, /admin/settings        | Admin panel. Requires admin.access permission. Separate layout.      |

1.3 Developer Experience Features

- One-command setup: npx shipstation init — prompts for DB URL, Stripe keys, Resend key, creates .env, runs migrations, seeds demo data including default roles and permissions.


- Seed script: creates Super Admin user, default roles with permissions, 3 subscription plans, and sample data.


- Environment validation: Zod schema validates .env at startup. Missing keys produce clear error messages.


- Path aliases: @/components, @/lib, @/server, @/hooks, @/types.


- ESLint + Prettier: pre-configured with opinionated rules.


- VS Code recommended extensions and settings included.


- Inline code comments: every file has a header comment. Complex logic explained inline.

Module 2: Authentication (Better Auth)

2.1 Overview

Self-hosted authentication using Better Auth 1.4. No third-party service dependency, no per-user pricing. All user data stays in the buyer’s database. Every user in the system is a single entity in the users table — admins are simply users assigned a role with admin-level permissions.

2.2 Auth Features

- Email + password registration with email verification via Resend.


- Social login: Google OAuth 2.0, GitHub OAuth. More providers added with one line of config and an env key.


- Magic link (passwordless) login: user enters email, receives a one-time login link.


- Forgot password: email with time-limited reset link (1-hour expiry). Token stored hashed in DB.


- Two-factor authentication (2FA): TOTP via authenticator app. QR code setup with 8 backup recovery codes.


- Session management: secure HTTP-only cookies. Configurable duration (default 7 days). Session table in DB for revocation.


- Account settings: update name, email (re-verification required), avatar upload, change password, enable/disable 2FA, view active sessions with device/IP info, revoke sessions.


- Account deletion: soft-delete with 7-day grace period. User can restore within 7 days. After grace period, account remains soft-deleted but is excluded from all queries.

2.3 User Creation Flows

There are two ways a user enters the system:

- **Self-registration (/sign-up):** User signs up via the public registration page. They are automatically assigned the default role (the role with isDefault = true, which is the “User” role). They never see the admin panel.


- **Admin invitation (/admin/users → Invite):** An admin invites a new user by entering their email and selecting a role. The invitee receives an email with a sign-up link. When they complete registration, they are assigned the role the admin selected instead of the default role. This is how admins, editors, support agents, or any custom role gets created.

An admin can also change any existing user’s role from the admin panel. For example, promoting a normal user to an admin role, or demoting them back. The user’s permissions update immediately — their next page load reflects the new role.

2.4 Auth Pages

|                           |                                                                                                                                |
|---------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| **Page**                  | **Details**                                                                                                                    |
| **/sign-up**              | Email + password form, social login buttons, link to sign-in. Zod validation. Assigns default role. Redirects to verify-email. |
| **/sign-up?invite=TOKEN** | Same page, but pre-fills email from invite and assigns the invited role on completion.                                         |
| **/sign-in**              | Email + password, social login, magic link tab. “Remember me” checkbox. Redirects to dashboard.                                |
| **/forgot-password**      | Email input. Always shows success (prevents email enumeration). Sends reset link.                                              |
| **/reset-password**       | New password + confirm. Token validated server-side. Redirects to sign-in.                                                     |
| **/verify-email**         | Shown after registration. Auto-checks verification. Resend link with 60-second cooldown.                                       |

2.5 Auth Database Schema

- users: id (cuid), name, email (unique), emailVerified, image, roleId (FK to roles), stripeCustomerId, hashedPassword, twoFactorEnabled, twoFactorSecret (encrypted), isActive (boolean, default true), createdAt, updatedAt, deletedAt (nullable)


- sessions: id, userId (FK), token, expiresAt, ipAddress, userAgent, createdAt, deletedAt (nullable)


- accounts: id, userId (FK), provider, providerAccountId, accessToken, refreshToken, expiresAt, deletedAt (nullable)


- verificationTokens: id, identifier (email), token (hashed), expiresAt


- twoFactorBackupCodes: id, userId (FK), code (hashed), usedAt


- userInvitations: id, email, roleId (FK), invitedBy (FK to users), token (unique), status (pending/accepted/expired), expiresAt, createdAt

Soft Delete Policy: Every model that supports deletion uses a deletedAt (nullable DateTime) field instead of hard deletes. Prisma middleware globally filters out records where deletedAt IS NOT NULL on all find/findMany/count queries. Delete operations set deletedAt = now() instead of removing the row. No data is ever permanently destroyed. This is enforced at the ORM layer so every query benefits automatically.

Module 3: Role-Based Access Control (RBAC)

3.1 Overview

A database-driven RBAC system with module-level and action-level granularity. Permissions, roles, and assignments are stored in the database — not hardcoded on frontend or backend. The admin manages roles and permissions entirely from the admin panel UI. No code changes are needed to create new roles or modify access.

3.2 Permission Format

Every permission follows the format: module.action. Examples:

|                     |                                         |            |
|---------------------|-----------------------------------------|------------|
| **Permission Key**  | **Description**                         | **Module** |
| **admin.access**    | Can access the admin panel              | Admin      |
| **users.view**      | Can view user list and details          | Users      |
| **users.create**    | Can invite new users                    | Users      |
| **users.edit**      | Can edit user details and change roles  | Users      |
| **users.delete**    | Can delete/suspend users                | Users      |
| **roles.view**      | Can view roles and their permissions    | Roles      |
| **roles.create**    | Can create new roles                    | Roles      |
| **roles.edit**      | Can edit role permissions               | Roles      |
| **roles.delete**    | Can delete non-system roles             | Roles      |
| **plans.view**      | Can view subscription plans             | Plans      |
| **plans.edit**      | Can edit plan details                   | Plans      |
| **settings.view**   | Can view system settings                | Settings   |
| **settings.edit**   | Can modify system settings              | Settings   |
| **projects.view**   | Can view own projects                   | Projects   |
| **projects.create** | Can create projects                     | Projects   |
| **projects.edit**   | Can edit own projects                   | Projects   |
| **projects.delete** | Can delete own projects                 | Projects   |
| **billing.manage**  | Can manage own subscription and billing | Billing    |

The buyer extends this list by adding rows to the permissions table. No code changes needed for new permissions — just add the permission, assign it to roles, and check it in middleware or server actions.

3.3 Default System Roles

Two immutable system roles are seeded on first setup:

|                 |              |                                |                                                                                                       |
|-----------------|--------------|--------------------------------|-------------------------------------------------------------------------------------------------------|
| **Role**        | **isSystem** | **isDefault**                  | **Permissions**                                                                                       |
| **Super Admin** | true         | false                          | All permissions. Full system access. Cannot be deleted or have permissions removed.                   |
| **User**        | true         | true (auto-assigned on signup) | projects.view, projects.create, projects.edit, projects.delete, billing.manage. Basic product access. |

System roles (isSystem = true) cannot be deleted. The Super Admin role’s permissions cannot be modified. The User role’s permissions can be modified by the admin (e.g., remove projects.delete if the buyer wants to restrict that), but the role itself cannot be deleted since it’s the default assignment for new signups.

3.4 Custom Roles (Buyer-Created)

From the admin panel (/admin/roles), the admin can create custom roles tailored to their product. Examples documented in the PDF manual:

- Editor: admin.access, users.view, settings.view — can access admin panel and view users/settings but cannot modify.


- Support Agent: admin.access, users.view, users.edit — can access admin and help users but cannot delete or manage roles.


- Manager: admin.access, users.view, users.create, users.edit, plans.view, settings.view — broader admin access without destructive permissions.

Custom roles have isSystem = false and can be freely created, edited, or deleted by anyone with roles.create / roles.edit / roles.delete permissions.

3.5 Permission Checking

Permissions are enforced at two levels:

- **Server-side (authoritative):** Every server action and API route checks the current user’s permissions before executing. A helper function hasPermission(userId, 'module.action') queries the user’s role → role_permissions → permissions chain. Returns boolean. If false, returns 403 Forbidden. This is the security boundary — the frontend cannot bypass it.


- **Client-side (UI-level):** The user’s permissions array is loaded once on auth (included in the session object). Components use a usePermission('module.action') hook to conditionally render UI elements. For example: the “Delete User” button only renders if the current user has users.delete permission. The sidebar only shows the Admin link if the user has admin.access. This is purely cosmetic — the real enforcement is server-side.

3.6 RBAC Database Schema

- permissions: id (cuid), key (unique, e.g., 'users.view'), module (e.g., 'users'), action (e.g., 'view'), description, createdAt


- roles: id (cuid), name (unique, e.g., 'Super Admin'), description, isSystem (boolean, default false), isDefault (boolean, default false — only one role can be default), createdAt, updatedAt, deletedAt (nullable)


- rolePermissions: id, roleId (FK to roles), permissionId (FK to permissions), unique constraint on \[roleId, permissionId\]

Users table (defined in Module 2) references roles via roleId (FK). One user = one role. One role = many permissions.

3.7 Admin Panel — Roles Management (/admin/roles)

- Roles list: table showing role name, description, isSystem badge, number of users assigned, number of permissions.


- Create role: form with name, description, and a permissions matrix. The matrix groups permissions by module (Users, Roles, Plans, Settings, Projects, Billing) with checkboxes for each action.


- Edit role: same form pre-filled. System roles show a lock icon and restricted editing (Super Admin is fully locked, User role allows permission changes but not deletion).


- Delete role: confirmation dialog. Cannot delete system roles. Cannot delete a role that has users assigned — admin must reassign users first. Shows count of affected users.


- View role: detail view showing all permissions grouped by module, and a list of users assigned to this role.

Module 4: Subscription Billing (Better Auth Stripe Plugin)

4.1 Overview

Subscription billing is handled via @better-auth/stripe — the official Better Auth Stripe plugin. Since authentication and payments are tightly coupled (customer creation on signup, subscription gating on session, webhook processing), using the plugin keeps everything in one system instead of maintaining a separate Stripe integration. The buyer configures Stripe keys in .env and plans in the Better Auth config — billing works out of the box.

4.2 What the Plugin Handles

- Automatic Stripe customer creation on signup (createCustomerOnSignUp: true). The stripeCustomerId is stored on the user record.


- Subscription upgrade: authClient.subscription.upgrade({ plan, successUrl, cancelUrl }) — creates a Stripe Checkout Session and redirects the user. One line of code.


- Plan switching: same upgrade() method with the existing subscriptionId parameter. Stripe handles proration automatically.


- Subscription cancellation: authClient.subscription.cancel({ returnUrl }) — redirects to Stripe Billing Portal for cancellation.


- Subscription restore: authClient.subscription.restore({ subscriptionId }) — reactivates a subscription that was canceled but hasn’t ended yet.


- Billing Portal: authClient.subscription.billingPortal({ returnUrl }) — redirects to Stripe’s hosted portal for payment method updates, invoice history, and self-service management.


- List active subscriptions: authClient.subscription.list() — returns subscription status, plan name, limits, and period dates. Used for UI gating and usage enforcement.


- Webhook handling: the plugin auto-handles checkout.session.completed, customer.subscription.created, customer.subscription.updated, and customer.subscription.deleted. Custom events (invoice.paid, invoice.payment_failed) handled via the onEvent hook.


- Trial periods: per-plan freeTrial config with days, onTrialStart, onTrialEnd, onTrialExpired hooks. Automatic trial abuse prevention — one trial per user across all plans.


- Lifecycle hooks: onSubscriptionComplete, onSubscriptionUpdate, onSubscriptionCancel — used to trigger emails (payment confirmation, payment failed, subscription canceled).

4.3 Plan Configuration

Plans defined directly in the Better Auth Stripe plugin config:

- Each plan: name, priceId (monthly), annualDiscountPriceId (yearly), limits object (e.g., { projects: 5, storage: 10 }), optional freeTrial.


- Plans can be static (array in config) or dynamic (async function that fetches from database).


- Ships with 3 defaults: Free (no Stripe session, default limits), Pro ($19/mo or $190/yr, 14-day trial), Business ($49/mo or $490/yr).


- Pricing page reads from a shared plans config that mirrors the plugin config. One source of truth.


- Annual billing toggle: monthly/yearly switch with “2 months free” badge on yearly.

4.4 Usage Enforcement

- Server-side middleware calls auth.api.listActiveSubscriptions() to get the current user’s plan and limits.


- Before resource creation (e.g., new project), the server checks the plan’s limits object (e.g., limits.projects) against current count.


- If limit exceeded: returns 403 with an upgrade prompt. No resource is created.


- Free plan users: default limits enforced without Stripe. No checkout required for free tier.

4.5 Billing Database Schema (Plugin-Managed)

The @better-auth/stripe plugin auto-generates and manages these tables via Better Auth’s migration CLI:

- subscription: id, plan, referenceId (userId by default), stripeCustomerId, stripeSubscriptionId, status (active/canceled/trialing/incomplete/past_due), periodStart, periodEnd, cancelAtPeriodEnd, cancelAt, canceledAt, endedAt, seats, trialStart, trialEnd, deletedAt (nullable)


- user table (extended): stripeCustomerId field added automatically by the plugin.

We do not define a custom subscriptions or invoices table. The plugin manages the schema. Invoices are accessed via Stripe’s Customer Portal or API — no local invoice table needed.

Module 5: User Dashboard

5.1 Layout

- Responsive sidebar layout (collapsible on mobile). Sidebar contains: nav links, plan badge, user avatar dropdown, dark/light mode toggle.


- Sidebar dynamically shows/hides the Admin link based on admin.access permission.


- Top bar with breadcrumbs. Main content area with consistent padding and max-width.

5.2 Dashboard Pages

|                         |                                                                                                                                                        |
|-------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Page**                | **Content**                                                                                                                                            |
| **/dashboard**          | Overview: welcome message, stats cards (total projects, usage this month, plan status, days until renewal), quick-action grid.                         |
| **/dashboard/settings** | Account settings: profile info, change password, 2FA setup, active sessions, danger zone (delete account).                                             |
| **/dashboard/billing**  | Current plan card, usage vs. limits progress bars, upgrade/downgrade buttons, Stripe Portal link, invoice history. Requires billing.manage permission. |
| **/dashboard/projects** | CRUD example. Requires projects.view / projects.create / projects.edit / projects.delete permissions respectively.                                     |

5.3 CRUD Example (Projects)

Fully working CRUD module demonstrating the patterns buyers follow when building their own features:

Project model: id, userId (FK), name, description, status (active/paused/archived), createdAt, updatedAt, deletedAt (nullable).

List view: paginated table (10/page), sort by name/date/status, search by name, status filter.

Create: modal dialog with Zod-validated form. Server action creates project. Checks projects.create permission and plan limit. Optimistic UI via TanStack Query.

Edit: same modal pre-filled. Server action checks projects.edit permission.

Delete: confirmation dialog. Server action checks projects.delete permission. Optimistic removal.

Plan limit enforcement: checks project count against plan limit before creation. Upgrade prompt if exceeded.

5.4 UI Components Used

Layout: Sidebar, Sheet (mobile nav), Breadcrumb, Avatar, DropdownMenu, Badge

Data display: Card, Table, DataTable (sorting/pagination), Tabs, Progress, Skeleton

Forms: Input, Textarea, Select, Switch, Checkbox, Form (react-hook-form + Zod)

Feedback: Toast, Alert, AlertDialog (confirmations), Tooltip

Overlays: Dialog, Sheet, Popover, Command (search palette)

Module 6: Admin Panel

6.1 Overview

Dedicated admin section. Access requires the admin.access permission. Each admin page is further gated by its module-specific permissions. The admin panel is where roles, users, plans, and system settings are managed.

6.2 Admin Pages

|                     |                                                                                                                      |                                                                                    |
|---------------------|----------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------|
| **Page**            | **Content**                                                                                                          | **Required Permissions**                                                           |
| **/admin**          | Dashboard: total users (trend), subscriptions by plan (pie chart), MRR, signups (7 days), revenue chart (12 months). | admin.access                                                                       |
| **/admin/users**    | User management: searchable table. View details, change role, invite new user, suspend, delete.                      | admin.access + users.view (+ users.edit / users.delete for actions)                |
| **/admin/roles**    | Role management: list roles, create/edit/delete roles, permissions matrix UI.                                        | admin.access + roles.view (+ roles.create / roles.edit / roles.delete for actions) |
| **/admin/plans**    | Plan management: view and edit plan display details, toggle active/inactive.                                         | admin.access + plans.view (+ plans.edit)                                           |
| **/admin/settings** | System settings: site name, URL, support email, announcement banner, maintenance mode.                               | admin.access + settings.view (+ settings.edit)                                     |

6.3 Admin Middleware

Route-level middleware checks session → user’s role → admin.access permission. Redirects to /dashboard with toast if missing.

Each admin page’s server actions additionally check the specific permission (e.g., users.delete before deleting a user). Return 403 if not authorized.

UI components use the usePermission() hook to conditionally render action buttons, so users with limited admin access only see what they can do.

Module 7: Landing Page & Marketing

7.1 Pages Included

|                    |                                                                                                                                                                                                  |
|--------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Page**           | **Sections & Details**                                                                                                                                                                           |
| **/ (Homepage)**   | Hero with headline + CTA + screenshot, social proof bar, features grid (6 with icons), how-it-works (3 steps), pricing (from config), testimonials (3 cards), FAQ accordion, CTA banner, footer. |
| **/pricing**       | Standalone pricing page with monthly/yearly toggle, plan comparison table, billing FAQ.                                                                                                          |
| **/blog**          | MDX-powered blog. List with cards (title, excerpt, date, reading time). Individual posts with TOC.                                                                                               |
| **/blog/\[slug\]** | Blog post from MDX. Code blocks with syntax highlighting, images, auto-generated anchor links.                                                                                                   |
| **/contact**       | Contact form (name, email, message) via Resend. Honeypot spam field. Success confirmation.                                                                                                       |

7.2 Landing Page Approach

One well-designed landing page customizable via a config file and Tailwind CSS theme tokens. Change colors, fonts, and content in one file.

7.3 SEO

Dynamic metadata per page: title, description, OG image, canonical URL.

Auto-generated sitemap.xml and robots.txt.

JSON-LD: Organization schema on homepage, BlogPosting schema on posts.

Dynamic OG images for blog posts via @vercel/og.

Marketing pages statically generated (SSG) for instant loads.

7.4 Design

Dark/light mode: system preference + manual toggle via Tailwind’s dark: prefix.

Design tokens in CSS @theme (Tailwind 4.2). One place to change the entire look.

Default font: Inter via next/font. Easy to swap.

Responsive: tested at 375px, 768px, and 1280px+.

Module 8: Transactional Email System

8.1 Overview

Email templates built with React Email. Sent via Resend 6.9. Every email is a React component the buyer customizes.

8.2 Email Templates Included

|                           |                                                                                                 |
|---------------------------|-------------------------------------------------------------------------------------------------|
| **Template**              | **Trigger & Content**                                                                           |
| **Welcome Email**         | Sent on registration. Greeting, quick-start link, support contact.                              |
| **Email Verification**    | Sent on registration or email change. Verification link (24h expiry).                           |
| **Password Reset**        | Sent on forgot-password. Reset link (1h expiry).                                                |
| **Magic Link Login**      | Sent on passwordless login request. One-time login link.                                        |
| **User Invitation**       | Sent when admin invites a user. Contains sign-up link with invite token and assigned role name. |
| **Payment Confirmation**  | Sent after Stripe payment. Plan name, amount, next billing date.                                |
| **Payment Failed**        | Sent on failed invoice. Prompts to update payment method.                                       |
| **Subscription Canceled** | Confirms access until period end. Re-subscribe link.                                            |
| **Contact Form**          | Sent to admin email on form submission. Sender info and message.                                |

8.3 Email Utility

Helper: sendEmail(to, template, data) — renders React Email to HTML, sends via Resend.

Preview: npx email dev for in-browser template preview during development.

Configurable: from address, reply-to, company name via .env.

Module 9: Deployment & DevOps

9.1 Vercel (Recommended)

One-click deploy button in README with environment variable prompts.

DB on Neon (free tier) or Supabase. Configured via DATABASE_URL.

Automatic preview deployments on PRs. Production deploys on main.

9.2 Docker (Self-Hosted)

Dockerfile: multi-stage build. Final image ~150MB.

docker-compose.yml: app + PostgreSQL containers.

Setup script: ./deploy.sh — pulls, migrates, starts.

Nginx reverse proxy config for custom domain + SSL.

9.3 Environment Variables

Documented .env.example included:

DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL

STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

RESEND_API_KEY, EMAIL_FROM

GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET

NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_APP_NAME

UPLOADTHING_SECRET, UPLOADTHING_APP_ID

Module 10: Documentation & CodeCanyon Deliverables

10.1 Documentation

README.md: quick start (under 5 min), tech stack, project structure, env vars, deployment.

PDF Manual (30+ pages): installation, configuration, RBAC setup guide (creating roles, assigning permissions), customization, adding features, deployment, troubleshooting.

Video walkthrough (10–15 min): install, run locally, Stripe setup, Vercel deploy, customize landing page, create a custom role, add a feature.

Inline code comments: header docs on every file. Complex logic explained.

CHANGELOG.md: version history.

10.2 CodeCanyon Listing Assets

Preview image: 590×300px thumbnail.

Screenshots: 8–12 — landing, dashboard, admin, roles/permissions UI, auth pages, mobile, dark mode.

Live demo on Vercel with demo accounts (Super Admin + User).

Listing description: SEO-optimized with feature list, tech stack, comparison table, FAQ.

Tags: nextjs, saas, starter kit, boilerplate, typescript, tailwind, stripe, react, shadcn, rbac, better-auth.

Security Architecture

Security is a first-class concern in ShipStation. The following protections are built in and active out of the box. This section also documents additional security measures that buyers can enable on demand depending on their product’s requirements.

Built-In Security (Ships by Default)

Authentication & Session Security

Passwords hashed with bcrypt (cost factor 12). Plain-text passwords never stored or logged.

Session tokens stored in secure, HTTP-only, SameSite=Lax cookies. Not accessible from JavaScript.

Session stored server-side in the database. Revocable at any time (per-session or all sessions).

Two-factor authentication (TOTP) with encrypted secrets and hashed backup codes.

Email verification required before account activation. Magic link tokens are single-use.

Password reset tokens hashed in DB, expire in 1 hour, single-use.

OAuth state parameter validation to prevent CSRF on social login flows.

Authorization & Access Control

Database-driven RBAC: every mutation checks permissions server-side via hasPermission(). Frontend checks are cosmetic only.

Route-level middleware gates admin panel and dashboard. Unauthenticated users redirected to sign-in.

Permissions cached in session object. Cache invalidated immediately on role change.

System roles (Super Admin, User) are immutable and cannot be deleted or escalated by other admins.

Input & Data Security

All user input validated with Zod schemas on both client and server. No unvalidated data reaches the database.

SQL injection prevention: Prisma 7 uses parameterized queries exclusively. No raw SQL exposed.

XSS prevention: React auto-escapes output. Content Security Policy (CSP) headers configured.

CSRF protection: SameSite cookies + origin header validation on all mutations.

Environment secrets isolated: NEXT_PUBLIC\_ prefix required for client-exposed variables. All sensitive keys (Stripe secret, DB URL, auth secret) are server-only.

Payment Security

Stripe webhook signature verification via stripeWebhookSecret. Rejects tampered payloads.

No credit card data touches our server. All payment handled by Stripe’s hosted Checkout and Portal.

Subscription status synced via webhooks only — client cannot self-report payment status.

Data Protection

Soft deletes everywhere: no data is permanently destroyed. deletedAt timestamp on all deletable models. Prisma middleware enforces globally.

2FA secrets encrypted at rest (AES-256) before storage. Backup codes stored hashed.

Account deletion with 7-day grace period for recovery. Soft-deleted, not purged.

Rate Limiting & Abuse Prevention

Auth routes rate-limited: 5 attempts per 15 minutes per IP (sign-in, sign-up, forgot-password, magic link).

API routes rate-limited: 100 requests per minute per user.

Contact form: honeypot field to catch bots. No CAPTCHA dependency by default.

Stripe trial abuse prevention: one trial per user across all plans (handled by the plugin automatically).

Available On Demand (Buyer-Enabled)

The following security enhancements are documented in the PDF manual with implementation guides. They are not enabled by default to keep the starter kit lightweight, but can be added with minimal effort:

CAPTCHA integration: Better Auth has a built-in captcha plugin supporting Google reCAPTCHA and Cloudflare Turnstile. Protects signup, signin, and password reset. Add one plugin config line + env key.

IP allowlisting / geo-blocking: restrict admin panel access to specific IPs or regions using Next.js middleware.

Audit logging: log every admin action (role change, user suspension, settings update) with userId, action, timestamp, and metadata. Guide includes schema and helper function.

API key authentication: Better Auth has an API keys plugin with rate limiting, expiration, and metadata. Useful when the buyer’s product exposes a public API.

Row-level security (RLS): guide for enabling Prisma-level query filters per-tenant for multi-tenant SaaS.

Content Security Policy (CSP) hardening: stricter CSP directives for production (nonce-based scripts, blocked inline styles).

Security headers (Helmet): X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. Middleware template provided.

Account lockout: lock accounts after N failed login attempts. Unlock via email link or admin action.

Data export (GDPR): endpoint that exports all user data as JSON. Guide for buyer to extend per their data model.

Security Summary Table

|                                     |               |                                 |
|-------------------------------------|---------------|---------------------------------|
| **Protection**                      | **Status**    | **Implementation**              |
| **Password hashing (bcrypt)**       | **Built-in**  | Better Auth default             |
| **HTTP-only session cookies**       | **Built-in**  | Better Auth default             |
| **2FA (TOTP + backup codes)**       | **Built-in**  | Better Auth plugin              |
| **Server-side RBAC**                | **Built-in**  | Custom middleware + helpers     |
| **Zod input validation**            | **Built-in**  | All forms + server actions      |
| **SQL injection prevention**        | **Built-in**  | Prisma parameterized queries    |
| **XSS prevention + CSP**            | **Built-in**  | React escaping + headers        |
| **CSRF protection**                 | **Built-in**  | SameSite cookies + origin check |
| **Stripe webhook verification**     | **Built-in**  | Plugin handles signature        |
| **Rate limiting (auth + API)**      | **Built-in**  | Middleware per route            |
| **Soft deletes (no data loss)**     | **Built-in**  | Prisma middleware global        |
| **Trial abuse prevention**          | **Built-in**  | Stripe plugin automatic         |
| **CAPTCHA (reCAPTCHA / Turnstile)** | **On demand** | Better Auth captcha plugin      |
| **Audit logging**                   | **On demand** | Guide + schema in docs          |
| **API key auth**                    | **On demand** | Better Auth API keys plugin     |
| **IP allowlisting / geo-blocking**  | **On demand** | Middleware template in docs     |
| **Security headers (Helmet)**       | **On demand** | Middleware template in docs     |
| **Account lockout**                 | **On demand** | Guide in docs                   |
| **GDPR data export**                | **On demand** | Guide + endpoint in docs        |

Non-Functional Requirements

Performance

Lighthouse: 95+ on all marketing pages.

FCP: under 1s on marketing pages (SSG).

Dashboard transitions: under 200ms.

API responses: under 200ms for CRUD.

RBAC permission checks: cached in session, no extra DB query per request. Cache invalidated on role change.

Bundle: under 200KB gzipped initial load.

Accessibility

WCAG 2.1 AA: heading hierarchy, ARIA labels, keyboard nav, focus management.

Shadcn UI / Radix UI: accessible by default.

Color contrast: 4.5:1 in both modes.

Code Quality

TypeScript strict mode. No untyped code.

ESLint: next/core-web-vitals. Zero warnings.

Prettier: format-on-save.

No file over 300 lines.

Development Roadmap

Day 1: Foundation + Auth + RBAC

Initialize Next.js 16.1 with TypeScript 5.9 + Tailwind CSS 4.2

Install and configure Shadcn UI components

Set up Prisma 7.4 schema: users, sessions, accounts, roles, permissions, rolePermissions, userInvitations, projects, settings — all with deletedAt for soft deletes

Prisma middleware for global soft-delete filtering (deletedAt IS NULL on all queries)

Configure Better Auth 1.4: email/password + Google + GitHub + magic link + 2FA

Build auth pages: sign-up (with invite flow), sign-in, forgot-password, verify-email

Implement RBAC: permission checking helper (server-side), usePermission hook (client-side), session permission caching

Seed script: Super Admin user, User role, all default permissions, 3 plans, sample data

Day 2: Dashboard + Billing + Admin + Roles UI

Dashboard layout (sidebar with permission-based nav, topbar, breadcrumbs)

Dashboard home, settings, billing pages

Stripe billing via @better-auth/stripe plugin: plan config, upgrade/cancel/restore flows, webhook hooks, usage enforcement

Plan config with limits enforcement

Projects CRUD (list, create, edit, delete — all permission-gated)

Admin panel: dashboard with charts, user management (invite + role change), plan management, system settings

Roles management page: list, create, edit, delete roles with permissions matrix UI

Day 3: Marketing + Email + Polish

Landing page (hero, features, pricing, testimonials, FAQ, footer)

Pricing page with toggle, blog (MDX), contact page

All 9 email templates (React Email + Resend) including user invitation email

Dark/light mode, SEO (metadata, sitemap, robots.txt, OG images)

Docker setup (Dockerfile + docker-compose.yml + Nginx)

Environment validation with Zod

Day 4: Documentation + Submission

README.md

PDF documentation (30+ pages, includes RBAC guide with screenshots)

Video walkthrough

Deploy live demo to Vercel

CodeCanyon listing assets

Final testing: Lighthouse, mobile, auth flows, Stripe E2E, RBAC (test each role), admin panel

Submit to CodeCanyon

CodeCanyon Listing Strategy

Pricing

Regular License: $49

Extended License: $249

Key Selling Points

1.  Save 3+ months. Auth, RBAC, payments, admin, email, SEO — pre-built and tested.


1.  March 2026 stack: Next.js 16.1, React 19, TypeScript 5.9, Tailwind 4.2, Prisma 7.4, Better Auth 1.4.

2.  Database-driven RBAC: permissions table, roles with granular module.action control, admin UI for role management. No hardcoded roles.

3.  Self-hosted auth: no Clerk/Auth0 dependency. No per-user costs. Your database, your users.

4.  Stripe billing via official Better Auth plugin: Checkout, Portal, webhooks, trials, usage limits — all handled.

5.  12 built-in security protections: bcrypt hashing, HTTP-only sessions, 2FA, RBAC, input validation, CSRF, XSS, CSP, rate limiting, webhook verification, soft deletes, trial abuse prevention.

6.  9 on-demand security add-ons documented: CAPTCHA, audit logging, API keys, IP allowlisting, security headers, account lockout, GDPR export.

7.  Soft deletes everywhere: no data is ever permanently destroyed. deletedAt field on all models, Prisma middleware enforces globally.

8.  Customizable landing page: change brand, colors, fonts from one config file.

9.  Full admin panel: users, roles & permissions, plans, revenue dashboard, system settings.

10. 9 React Email templates including user invitation flow.

11. Dark mode, responsive, WCAG 2.1 AA accessible.

12. One-command setup. Vercel in 5 min or Docker self-hosted.

13. 30-page PDF + video + inline code comments.

14. Working CRUD with server actions, optimistic updates, pagination, permission gating, plan limits.

15. 6 months support. Regular updates.

Post-Launch Updates

Week 2: Blog comments (complex feature pattern).

Week 4: Team/organization support (multi-tenancy lite).

Month 2: API key management.

Month 3: Waitlist/pre-launch mode.

Regular updates maintain CodeCanyon visibility and buyer confidence.

*End of Document — ShipStation PRD v1.3 (Final)*