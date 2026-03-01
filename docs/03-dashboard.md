# Module 03: User Dashboard

Layout, account settings, billing page, and the Projects CRUD example.

---

## Layout

```
┌──────────────┬─────────────────────────────────────┐
│  [Logo]      │  Breadcrumbs: Dashboard > Projects   │
│              │─────────────────────────────────────│
│  Dashboard   │                                     │
│  Projects    │  Main Content Area                  │
│  Billing     │                                     │
│  Settings    │                                     │
│              │                                     │
│  ──────────  │                                     │
│  Admin ←     │                                     │
│  (if perm)   │                                     │
│              │                                     │
│  ──────────  │                                     │
│  [Pro] badge │                                     │
│  [Dark/☀]    │                                     │
│  [Avatar ▼]  │                                     │
│   Sign out   │                                     │
└──────────────┴─────────────────────────────────────┘
```

### Rules

- Sidebar: 256px desktop, full-width Sheet on mobile (collapsible)
- "Admin" link only renders if `usePermission(perm(Module.Admin, Action.Access))` is true
- Plan badge shows current plan name (Free / Pro / Business)
- Avatar dropdown: Profile, Settings, Sign Out
- Dark/Light toggle in sidebar footer
- Breadcrumbs in top bar, auto-generated from route segments
- Main content: `p-6`, `max-w-7xl`

### File Structure

```
src/app/(dashboard)/
├── layout.tsx                ← Shell (imports Sidebar, Topbar from components/layouts)
├── dashboard/
│   ├── page.tsx              ← Thin: imports DashboardHome from features/dashboard
│   ├── settings/
│   │   └── page.tsx          ← Thin: imports AccountSettings from features/settings
│   ├── billing/
│   │   └── page.tsx          ← Thin: imports BillingPage from features/billing
│   └── projects/
│       └── page.tsx          ← Thin: imports ProjectsList from features/projects

src/features/projects/
├── components/
│   ├── projects-list.tsx     — Table with pagination, sort, search, filter
│   ├── project-card.tsx      — Single project row/card
│   ├── create-project-dialog.tsx
│   └── edit-project-dialog.tsx
├── actions.ts                — createProject, updateProject, deleteProject
├── hooks.ts                  — useProjects, useCreateProject, etc.
├── validations.ts            — createProjectSchema, updateProjectSchema
└── types.ts                  — Project, ProjectFilters, etc.

src/features/billing/
├── components/
│   ├── billing-page.tsx
│   ├── plan-card.tsx
│   └── usage-bars.tsx
└── hooks.ts                  — useSubscription

src/features/settings/
├── components/
│   ├── account-settings.tsx
│   ├── profile-form.tsx
│   ├── change-password-form.tsx
│   ├── two-factor-setup.tsx
│   ├── active-sessions.tsx
│   └── delete-account.tsx
├── actions.ts
└── validations.ts
```

---

## Dashboard Home (`/dashboard`)

### Stats Cards (Row of 4)

- Total Projects (count)
- Plan Status (current plan name + badge)
- Usage (projects used / limit, e.g. "8 / 25")
- Days Until Renewal (or "Free Plan" if no subscription)

### Quick Actions (Grid)

- Create New Project
- View Billing
- Account Settings
- Admin Panel (only if `admin.access` permission)

### Recent Projects

List of last 5 projects with name, status badge, last updated date.

---

## Account Settings (`/dashboard/settings`)

Five sections, each as a Card:

### 1. Profile Information

- Name (editable)
- Email (editable — triggers re-verification via Better Auth)
- Avatar upload (via UploadThing)
- Save button

### 2. Change Password

- Current password
- New password
- Confirm new password
- Zod: min 8 chars, upper + lower + number

### 3. Two-Factor Authentication

- Enable/Disable toggle
- Enable flow: show QR code + manual key → verify with TOTP code → show 8 backup codes (one-time display, prompt to save)
- Disable flow: require TOTP code or backup code to confirm

### 4. Active Sessions

- Table: Device, IP Address, Last Active, "Current" badge on active session
- "Revoke" button per session (except current)
- "Revoke All Other Sessions" button

### 5. Danger Zone

- Delete Account button (red, destructive variant)
- Confirmation dialog explaining 7-day grace period
- Requires password confirmation
- Soft-deletes the account (`deletedAt = now()`)

---

## Billing Page (`/dashboard/billing`)

Requires `billing.manage` permission.

```
┌──────────────────────────────────────────────┐
│  Current Plan                                │
│  ┌────────────────────────────────────────┐  │
│  │ Pro Plan          $19/mo               │  │
│  │ Next billing: March 15, 2026           │  │
│  │ [Manage Billing] [Change Plan]         │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Usage                                       │
│  Projects: ████████░░ 20/25                  │
│  Storage:  ███░░░░░░░ 3.2/10 GB             │
│                                              │
│  Quick Actions                               │
│  [Upgrade to Business] [Cancel Subscription] │
│                                              │
│  Invoice History                             │
│  [Opens Stripe Portal]                       │
└──────────────────────────────────────────────┘
```

- Current plan card with name, price, next billing date
- Usage progress bars (projects count vs limit, storage vs limit)
- Upgrade/downgrade buttons → `authClient.subscription.upgrade()`
- Cancel → `authClient.subscription.cancel()`
- Manage Billing → `authClient.subscription.billingPortal()`
- Free plan users see an upgrade prompt instead of cancel/portal

---

## CRUD Example: Projects (`/dashboard/projects`)

This is the reference implementation buyers follow for their own features.

### Project Schema

```prisma
model Project {
  id          String   @id @default(cuid())
  userId      String
  name        String
  description String?
  status      String   @default("active") // active | paused | archived
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?
  @@map("projects")
}
```

### Validation

Location: `src/features/projects/validations.ts`

```typescript
import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
});

export const updateProjectSchema = createProjectSchema.extend({
  id: z.string().cuid(),
  status: z.enum(["active", "paused", "archived"]).optional(),
});
```

### List View

- Paginated table (10 per page)
- Sortable columns: Name, Status, Created Date
- Search by name (debounced 300ms)
- Status filter dropdown: All, Active, Paused, Archived
- "Create Project" button (gated by `perm(Module.Projects, Action.Create)`)
- Each row: Name, Description (truncated), Status badge, Actions
- Actions gated: Edit needs `perm(Module.Projects, Action.Edit)`, Delete needs `perm(Module.Projects, Action.Delete)`
- Empty state: illustration + "Create your first project" CTA
- Loading state: skeleton rows

### Create Flow

1. Click "Create Project" → Dialog opens
2. Form: Name + Description
3. Zod validation on submit
4. Server action `createProject()`:
   - Auth check
   - Permission check: `perm(Module.Projects, Action.Create)`
   - Plan limit check: `canCreateProject()`
   - Create in DB
   - Revalidate
5. Optimistic UI via TanStack Query — add to list immediately, rollback on error
6. Toast: "Project created"
7. If plan limit reached: upgrade prompt instead of form

### Edit Flow

1. Click Edit → Dialog pre-filled
2. Same form + status dropdown
3. Server action `updateProject()`:
   - Auth check
   - Permission check: `perm(Module.Projects, Action.Edit)`
   - Ownership check (`userId` matches)
   - Update in DB
4. Optimistic UI
5. Toast: "Project updated"

### Delete Flow

1. Click Delete → AlertDialog confirmation
2. Server action `deleteProject()`:
   - Auth check
   - Permission check: `perm(Module.Projects, Action.Delete)`
   - Ownership check
   - Soft-delete (`deletedAt = now()`)
3. Optimistic UI — remove from list
4. Toast: "Project deleted"

### Server Action Pattern

Location: `src/features/projects/actions.ts`

Every action follows this exact order:

```
1. Get session (unauthorized if missing)
2. Validate input (Zod)
3. Check permission (hasPermission + perm enum)
4. Check plan limits (if creation)
5. Verify ownership (if edit/delete)
6. Execute DB operation
7. Revalidate path/tag
8. Return result
```

### TanStack Query Hooks

Location: `src/features/projects/hooks.ts`

```typescript
export function useProjects(filters: ProjectFilters) {
  return useQuery({
    queryKey: ["projects", filters],
    queryFn: () => fetchProjects(filters),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProject,
    onMutate: async (newProject) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });
      const previous = queryClient.getQueryData(["projects"]);
      // Optimistically add to list
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["projects"], context?.previous);
      toast.error("Failed to create project");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
```

Same pattern for `useUpdateProject()` and `useDeleteProject()`.

---

## UI Components Used

| Category | Components                                                           |
| -------- | -------------------------------------------------------------------- |
| Layout   | Sidebar, Sheet (mobile nav), Breadcrumb, Avatar, DropdownMenu, Badge |
| Data     | Card, Table, DataTable (sort/pagination), Tabs, Progress, Skeleton   |
| Forms    | Input, Textarea, Select, Switch, Checkbox, Form (RHF + Zod)          |
| Feedback | Toast (sonner), Alert, AlertDialog, Tooltip                          |
| Overlays | Dialog, Sheet, Popover, Command (search palette)                     |
