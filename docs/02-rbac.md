# Module 02: Role-Based Access Control (RBAC)

Database-driven RBAC with `module.action` granularity. Permissions, roles, and assignments live in the database. Admins manage everything from the admin panel — no code changes needed for new roles or permissions.

One user = one role. One role = many permissions. Permissions are the atomic unit of access control.

---

## Permission Format

Every permission follows: `module.action`

### Enums (Single Source of Truth)

Location: `src/lib/constants.ts`

```typescript
export enum Module {
  Admin = 'admin',
  Users = 'users',
  Roles = 'roles',
  Plans = 'plans',
  Settings = 'settings',
  Projects = 'projects',
  Billing = 'billing',
}

export enum Action {
  Access = 'access',
  View = 'view',
  Create = 'create',
  Edit = 'edit',
  Delete = 'delete',
  Manage = 'manage',
}

/** Type-safe permission key builder */
export function perm(module: Module, action: Action): string {
  return `${module}.${action}`
}
```

Use these enums everywhere — server actions, hooks, middleware, seed script, admin UI. Never use raw permission strings like `'users.view'`. Always use `perm(Module.Users, Action.View)`.

### 18 Default Permissions (Seeded)

```
admin.access         — Can access the admin panel
users.view           — Can view user list and details
users.create         — Can invite new users
users.edit           — Can edit user details and change roles
users.delete         — Can delete/suspend users
roles.view           — Can view roles and their permissions
roles.create         — Can create new roles
roles.edit           — Can edit role permissions
roles.delete         — Can delete non-system roles
plans.view           — Can view subscription plans
plans.edit           — Can edit plan details
settings.view        — Can view system settings
settings.edit        — Can modify system settings
projects.view        — Can view own projects
projects.create      — Can create projects
projects.edit        — Can edit own projects
projects.delete      — Can delete own projects
billing.manage       — Can manage own subscription and billing
```

### Extending

Buyers add rows to the `permissions` table, assign to roles via `rolePermissions`, check with `hasPermission()`. No code changes.

---

## Database Schema (Our Tables)

```prisma
model Permission {
  id          String   @id @default(cuid())
  key         String   @unique  // "users.view"
  module      String             // "users"
  action      String             // "view"
  description String?
  createdAt   DateTime @default(now())
  rolePermissions RolePermission[]
  @@map("permissions")
}

model Role {
  id          String   @id @default(cuid())
  name        String   @unique  // "Super Admin"
  description String?
  isSystem    Boolean  @default(false)
  isDefault   Boolean  @default(false) // only ONE role can be default
  users       User[]   // relation to Better Auth's user table
  rolePermissions RolePermission[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?
  @@map("roles")
}

model RolePermission {
  id           String     @id @default(cuid())
  roleId       String
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permissionId String
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  @@unique([roleId, permissionId])
  @@map("role_permissions")
}
```

The `User` model (managed by Better Auth) gets a `roleId` FK pointing to `Role`. Added via Better Auth's user extension or appended to the generated schema.

---

## Default System Roles

| Role | isSystem | isDefault | Permissions |
|---|---|---|---|
| Super Admin | true | false | All 18 permissions |
| User | true | true (auto-assigned on signup) | projects.view, projects.create, projects.edit, projects.delete, billing.manage |

**Rules:**
- `isSystem = true` → cannot be deleted
- Super Admin → permissions cannot be modified
- User → permissions CAN be modified by admin, but role itself cannot be deleted
- Only ONE role can have `isDefault = true` at any time

---

## Permission Checking

### Server-Side (Security Boundary)

Location: `src/lib/rbac.ts`

```typescript
export async function hasPermission(userId: string, permissionKey: string): Promise<boolean> {
  const count = await prisma.rolePermission.count({
    where: {
      role: { users: { some: { id: userId, deletedAt: null } } },
      permission: { key: permissionKey },
    },
  })
  return count > 0
}

export async function hasPermissions(
  userId: string,
  keys: string[]
): Promise<Record<string, boolean>> {
  const results = await prisma.rolePermission.findMany({
    where: {
      role: { users: { some: { id: userId, deletedAt: null } } },
      permission: { key: { in: keys } },
    },
    select: { permission: { select: { key: true } } },
  })
  const granted = new Set(results.map((r) => r.permission.key))
  return Object.fromEntries(keys.map((k) => [k, granted.has(k)]))
}

export async function getUserPermissions(userId: string): Promise<string[]> {
  const results = await prisma.rolePermission.findMany({
    where: {
      role: { users: { some: { id: userId, deletedAt: null } } },
    },
    select: { permission: { select: { key: true } } },
  })
  return results.map((r) => r.permission.key)
}
```

Every server action that mutates data MUST call `hasPermission()` before executing. Always pass permissions using the enums:

```typescript
// ✅ Correct — type-safe
const canDelete = await hasPermission(userId, perm(Module.Users, Action.Delete))

// ❌ Wrong — raw string, no autocomplete, typo-prone
const canDelete = await hasPermission(userId, 'users.delete')
```

### Client-Side (Cosmetic Only)

Location: `src/hooks/use-permission.ts`

```typescript
export function usePermission(permissionKey: string): boolean {
  const { data: session } = useSession()
  return session?.user?.permissions?.includes(permissionKey) ?? false
}

export function usePermissions(keys: string[]): Record<string, boolean> {
  const { data: session } = useSession()
  const perms = session?.user?.permissions ?? []
  return Object.fromEntries(keys.map((k) => [k, perms.includes(k)]))
}
```

Use in components to conditionally render buttons, links, nav items. Always use enums:

```typescript
const canEdit = usePermission(perm(Module.Users, Action.Edit))
const canDelete = usePermission(perm(Module.Users, Action.Delete))
```

Never rely on this for security.

---

## Session Permission Caching

- `permissions: string[]` loaded into session on login via `getUserPermissions()`
- When admin changes a user's role → invalidate that user's session cache
- Next request re-fetches permissions from DB
- Implementation: update session `updatedAt` or use a version field to trigger refresh

---

## Admin Roles Management (`/admin/roles`)

```
src/app/(admin)/admin/roles/
├── page.tsx                  — Thin: imports RolesList from features/roles
├── create/page.tsx           — Thin: imports CreateRoleForm from features/roles
└── [id]/page.tsx             — Thin: imports EditRoleForm from features/roles

src/features/roles/
├── components/
│   ├── roles-list.tsx
│   ├── create-role-form.tsx
│   ├── edit-role-form.tsx
│   ├── permissions-matrix.tsx  — Checkbox grid grouped by Module enum
│   └── role-detail.tsx
├── actions.ts                — createRole, updateRole, deleteRole
├── validations.ts            — Zod schemas for role CRUD
└── types.ts                  — RoleWithPermissions, etc.
```

### List Page

Table: Role Name, Description, System badge (lock icon), Users Count, Permissions Count, Actions (View/Edit/Delete).

- System roles show lock icon, delete disabled
- "Create Role" button requires `roles.create`

### Create / Edit Role

Form fields:
- Name (required, unique)
- Description (optional)
- Permissions matrix — checkboxes grouped by module:

```
Module      │ view │ create │ edit │ delete │ other
────────────┼──────┼────────┼──────┼────────┼──────────
Admin       │  ☐   │   —    │  —   │   —    │ access
Users       │  ☐   │   ☐    │  ☐   │   ☐    │  —
Roles       │  ☐   │   ☐    │  ☐   │   ☐    │  —
Plans       │  ☐   │   —    │  ☐   │   —    │  —
Settings    │  ☐   │   —    │  ☐   │   —    │  —
Projects    │  ☐   │   ☐    │  ☐   │   ☐    │  —
Billing     │  —   │   —    │  —   │   —    │ manage
```

Edit restrictions:
- Super Admin: all checkboxes checked + disabled (immutable)
- User role: checkboxes enabled, name field locked
- Custom roles: fully editable

### Delete Role

- Cannot delete `isSystem = true` roles
- Cannot delete a role with assigned users → show error with user count, prompt to reassign first
- Confirmation dialog with role name

### View Role

Detail page showing all permissions grouped by module + list of users assigned to this role.

---

## Custom Roles (Buyer Examples)

Document these in the PDF manual as examples:

- **Editor:** admin.access, users.view, settings.view
- **Support Agent:** admin.access, users.view, users.edit
- **Manager:** admin.access, users.view, users.create, users.edit, plans.view, settings.view