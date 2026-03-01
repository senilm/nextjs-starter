# Module 04: Admin Panel

Dedicated admin section at `/admin/*`. Access requires `admin.access` permission. Each page is further gated by module-specific permissions.

---

## File Structure

```
src/app/(admin)/
├── layout.tsx                    ← Admin shell (imports AdminSidebar from components/layouts)
├── admin/
│   ├── page.tsx                  ← Thin: imports AdminDashboard from features/admin
│   ├── users/
│   │   └── page.tsx              ← Thin: imports UserManagement from features/admin
│   ├── roles/
│   │   ├── page.tsx              ← Thin: imports from features/roles (see 02-rbac.md)
│   │   ├── create/page.tsx
│   │   └── [id]/page.tsx
│   ├── plans/
│   │   └── page.tsx              ← Thin: imports PlanManagement from features/admin
│   └── settings/
│       └── page.tsx              ← Thin: imports SystemSettings from features/admin

src/features/admin/
├── components/
│   ├── admin-dashboard.tsx       — Stats cards + charts
│   ├── stats-card.tsx
│   ├── revenue-chart.tsx         — 12-month MRR bar chart (Recharts)
│   ├── subscriptions-chart.tsx   — Plan distribution pie/donut chart
│   ├── signups-chart.tsx         — 7-day signups line chart
│   ├── user-management.tsx       — User table with actions
│   ├── user-table.tsx
│   ├── user-detail-sheet.tsx     — Slide-over with full user info
│   ├── invite-user-dialog.tsx
│   ├── plan-management.tsx
│   ├── plan-card.tsx
│   └── system-settings-form.tsx
├── actions.ts                    — User CRUD, plan updates, settings updates
├── hooks.ts                      — useUsers, useAdminStats, etc.
├── validations.ts                — Invite, settings schemas
└── types.ts                      — AdminStats, UserWithRole, etc.
```

Roles management lives in `src/features/roles/` — see `02-rbac.md`.

---

## Access Control

### Route-Level

Admin layout checks:
1. User is authenticated
2. User has `perm(Module.Admin, Action.Access)`
3. If either fails → redirect to `/dashboard` with toast "Access denied"

### Page-Level Permissions

| Page | View | Actions |
|---|---|---|
| /admin | `admin.access` | — |
| /admin/users | `admin.access` + `users.view` | `users.create`, `users.edit`, `users.delete` |
| /admin/roles | `admin.access` + `roles.view` | `roles.create`, `roles.edit`, `roles.delete` |
| /admin/plans | `admin.access` + `plans.view` | `plans.edit` |
| /admin/settings | `admin.access` + `settings.view` | `settings.edit` |

Server actions always re-check the specific permission. UI uses `usePermission()` to show/hide action buttons.

---

## Admin Sidebar

```
Admin Sidebar:
├── Dashboard     (/admin)
├── Users         (/admin/users)      — only if users.view
├── Roles         (/admin/roles)      — only if roles.view
├── Plans         (/admin/plans)      — only if plans.view
├── Settings      (/admin/settings)   — only if settings.view
├── ──────────
├── Back to App   (/dashboard)
└── [Avatar ▼]
```

Each nav item only renders if user has the corresponding view permission.

---

## Admin Dashboard (`/admin`)

### Stats Cards (Row of 4)

- **Total Users** — count with 7-day trend arrow (↑↓ and percentage)
- **Active Subscriptions** — count with breakdown tooltip (X Free, Y Pro, Z Business)
- **MRR** — Monthly Recurring Revenue in dollars
- **New Signups** — last 7 days count

### Charts

- **Revenue:** 12-month bar chart showing MRR over time (Recharts BarChart)
- **Subscriptions by Plan:** Pie/donut chart (Free / Pro / Business)
- **Signups:** 7-day line chart

All charts use Recharts. Chart components live in `src/features/admin/components/`.

---

## User Management (`/admin/users`)

### User Table

Columns: Avatar + Name, Email, Role (badge), Plan (badge), Status (Active/Suspended), Joined Date, Actions

Features:
- Search by name or email (debounced 300ms)
- Filter by role (dropdown)
- Filter by plan (dropdown)
- Filter by status (Active / Suspended)
- Pagination (10 per page)
- Sort by name, email, joined date

### Actions Per User

| Action | Permission | Behavior |
|---|---|---|
| View Details | `users.view` | Opens Sheet with full profile, role, permissions, subscription, last 5 sessions |
| Change Role | `users.edit` | Dropdown to select new role → immediate save → session cache invalidated |
| Suspend | `users.edit` | Sets `isActive = false`, revokes all sessions |
| Unsuspend | `users.edit` | Sets `isActive = true` |
| Delete | `users.delete` | Soft-delete with confirmation dialog |
| Invite User | `users.create` | Opens invite dialog |

### Invite User Flow

1. Click "Invite User" → Dialog opens
2. Fields: Email input + Role selector dropdown
3. Server action `inviteUser()`:
   - Check `perm(Module.Users, Action.Create)`
   - Validate email (Zod)
   - Create `UserInvitation` record with unique token, 7-day expiry
   - Send invitation email via Resend
4. Toast: "Invitation sent to email@example.com"

### User Detail Sheet

Slide-over panel showing:
- Full profile info (name, email, avatar, verified status)
- Current role + list of all permissions for that role
- Subscription details (plan, status, period dates)
- Login history (last 5 sessions with IP, device, last active)
- Account creation date
- Last active date

---

## Plan Management (`/admin/plans`)

### Plan Cards

Display each plan as a card:
- Plan name + description
- Monthly and yearly prices
- Limits (projects, storage)
- Active/Inactive toggle
- Subscriber count
- Edit button (requires `perm(Module.Plans, Action.Edit)`)

### Edit Plan

Editable fields (display properties only — price changes go through Stripe Dashboard):
- Display name
- Description
- Feature list (shown on pricing page)
- Active/Inactive toggle (inactive plans hidden from pricing page, existing subscribers keep access)

---

## System Settings (`/admin/settings`)

### Schema

```prisma
model SystemSettings {
  id              String   @id @default(cuid())
  siteName        String   @default("ShipStation")
  siteUrl         String   @default("http://localhost:3000")
  supportEmail    String   @default("support@shipstation.dev")
  announcementBar String?
  maintenanceMode Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  @@map("system_settings")
}
```

### Settings Form

- Site Name
- Site URL
- Support Email
- Announcement Banner — text input. When set, shows as a colored bar on all pages site-wide.
- Maintenance Mode toggle — when enabled, non-admin users see a maintenance page instead of the app.

Requires `perm(Module.Settings, Action.Edit)` to save. View requires `perm(Module.Settings, Action.View)`.