/**
 * @file seed.ts
 * @module prisma/seed
 * Idempotent seed script — safe to run multiple times without duplicates.
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

/* ── Seed Data ───────────────────────────── */

const PERMISSIONS = [
  { key: 'admin.access', module: 'admin', action: 'access', description: 'Access admin panel' },
  { key: 'users.view', module: 'users', action: 'view', description: 'View users' },
  { key: 'users.create', module: 'users', action: 'create', description: 'Create users' },
  { key: 'users.edit', module: 'users', action: 'edit', description: 'Edit users' },
  { key: 'users.delete', module: 'users', action: 'delete', description: 'Delete users' },
  { key: 'roles.view', module: 'roles', action: 'view', description: 'View roles' },
  { key: 'roles.create', module: 'roles', action: 'create', description: 'Create roles' },
  { key: 'roles.edit', module: 'roles', action: 'edit', description: 'Edit roles' },
  { key: 'roles.delete', module: 'roles', action: 'delete', description: 'Delete roles' },
  { key: 'plans.view', module: 'plans', action: 'view', description: 'View plans' },
  { key: 'plans.edit', module: 'plans', action: 'edit', description: 'Edit plans' },
  { key: 'settings.view', module: 'settings', action: 'view', description: 'View system settings' },
  { key: 'settings.edit', module: 'settings', action: 'edit', description: 'Edit system settings' },
  {
    key: 'projects.view',
    module: 'projects',
    action: 'view',
    description: 'View projects',
  },
  {
    key: 'projects.create',
    module: 'projects',
    action: 'create',
    description: 'Create projects',
  },
  { key: 'projects.edit', module: 'projects', action: 'edit', description: 'Edit projects' },
  {
    key: 'projects.delete',
    module: 'projects',
    action: 'delete',
    description: 'Delete projects',
  },
  { key: 'billing.manage', module: 'billing', action: 'manage', description: 'Manage billing' },
] as const

const USER_ROLE_PERMISSIONS = [
  'projects.view',
  'projects.create',
  'projects.edit',
  'projects.delete',
  'billing.manage',
]

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    description: 'For individuals getting started',
    monthlyPrice: 0,
    yearlyPrice: 0,
    trialDays: null,
    limits: { projects: 3, storage: 1 },
    features: ['3 projects', '1 GB storage', 'Community support'],
  },
  {
    key: 'pro',
    name: 'Pro',
    description: 'For professionals and small teams',
    monthlyPrice: 1900,
    yearlyPrice: 19000,
    trialDays: 14,
    limits: { projects: 25, storage: 10 },
    features: [
      '25 projects',
      '10 GB storage',
      'Priority support',
      'Advanced analytics',
      'Custom domains',
    ],
  },
  {
    key: 'business',
    name: 'Business',
    description: 'For growing businesses',
    monthlyPrice: 4900,
    yearlyPrice: 49000,
    trialDays: null,
    limits: { projects: 100, storage: 50 },
    features: [
      '100 projects',
      '50 GB storage',
      'Dedicated support',
      'Advanced analytics',
      'Custom domains',
      'SSO',
      'Audit logs',
    ],
  },
]

const SAMPLE_PROJECTS = [
  { name: 'Marketing Website', description: 'Company marketing site redesign', status: 'active' },
  { name: 'Mobile App v2', description: 'Next generation mobile application', status: 'active' },
  { name: 'API Gateway', description: 'Centralized API gateway service', status: 'active' },
  { name: 'Analytics Dashboard', description: 'Internal analytics platform', status: 'paused' },
  { name: 'Legacy Migration', description: 'Migrate legacy system to cloud', status: 'archived' },
]

/* ── Main Seed ───────────────────────────── */

async function main(): Promise<void> {
  /* 1. Permissions */
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: { module: perm.module, action: perm.action, description: perm.description },
      create: perm,
    })
  }
  console.log(`✓ ${PERMISSIONS.length} permissions created`)

  /* 2. Roles */
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'Super Admin' },
    update: { description: 'Full system access', isSystem: true, isDefault: false },
    create: {
      name: 'Super Admin',
      description: 'Full system access',
      isSystem: true,
      isDefault: false,
    },
  })

  const userRole = await prisma.role.upsert({
    where: { name: 'User' },
    update: { description: 'Default user role', isSystem: true, isDefault: true },
    create: {
      name: 'User',
      description: 'Default user role',
      isSystem: true,
      isDefault: true,
    },
  })
  console.log('✓ 2 system roles created (Super Admin, User)')

  /* 3. Role-Permission assignments */
  const allPermissions = await prisma.permission.findMany()

  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: superAdminRole.id, permissionId: perm.id },
      },
      update: {},
      create: { roleId: superAdminRole.id, permissionId: perm.id },
    })
  }

  const userPermissions = allPermissions.filter((p) => USER_ROLE_PERMISSIONS.includes(p.key))
  for (const perm of userPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: userRole.id, permissionId: perm.id },
      },
      update: {},
      create: { roleId: userRole.id, permissionId: perm.id },
    })
  }

  /* 4. Admin user */
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@shipstation.dev' },
    update: { roleId: superAdminRole.id },
    create: {
      name: 'Admin',
      email: 'admin@shipstation.dev',
      emailVerified: true,
      roleId: superAdminRole.id,
      isActive: true,
    },
  })
  console.log('✓ 1 admin user created (admin@shipstation.dev)')

  /* 5. Plans */
  for (const plan of PLANS) {
    await prisma.plan.upsert({
      where: { key: plan.key },
      update: {
        name: plan.name,
        description: plan.description,
        monthlyPrice: plan.monthlyPrice,
        yearlyPrice: plan.yearlyPrice,
        trialDays: plan.trialDays,
        limits: plan.limits,
        features: plan.features,
      },
      create: plan,
    })
  }
  console.log('✓ 3 plans configured')

  /* 6. Sample projects */
  const existingProjects = await prisma.project.count({ where: { userId: adminUser.id } })
  if (existingProjects === 0) {
    await prisma.project.createMany({
      data: SAMPLE_PROJECTS.map((p) => ({ ...p, userId: adminUser.id })),
    })
  }
  console.log('✓ 5 sample projects created')

  /* 7. System settings */
  const settingsCount = await prisma.systemSettings.count()
  if (settingsCount === 0) {
    await prisma.systemSettings.create({
      data: {
        siteName: 'ShipStation',
        siteUrl: 'http://localhost:3000',
        supportEmail: 'support@shipstation.dev',
      },
    })
  }
  console.log('✓ System settings initialized')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
