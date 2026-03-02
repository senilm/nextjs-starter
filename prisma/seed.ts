/**
 * @file seed.ts
 * @module prisma/seed
 * Idempotent seed script — safe to run multiple times without duplicates.
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Module, Action, perm } from '../src/lib/constants'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

/* ── Seed Data ───────────────────────────── */

const PERMISSIONS = [
  { key: perm(Module.Admin, Action.Access), module: Module.Admin, action: Action.Access, description: 'Access admin panel' },
  { key: perm(Module.Users, Action.View), module: Module.Users, action: Action.View, description: 'View users' },
  { key: perm(Module.Users, Action.Create), module: Module.Users, action: Action.Create, description: 'Create users' },
  { key: perm(Module.Users, Action.Edit), module: Module.Users, action: Action.Edit, description: 'Edit users' },
  { key: perm(Module.Users, Action.Delete), module: Module.Users, action: Action.Delete, description: 'Delete users' },
  { key: perm(Module.Roles, Action.View), module: Module.Roles, action: Action.View, description: 'View roles' },
  { key: perm(Module.Roles, Action.Create), module: Module.Roles, action: Action.Create, description: 'Create roles' },
  { key: perm(Module.Roles, Action.Edit), module: Module.Roles, action: Action.Edit, description: 'Edit roles' },
  { key: perm(Module.Roles, Action.Delete), module: Module.Roles, action: Action.Delete, description: 'Delete roles' },
  { key: perm(Module.Plans, Action.View), module: Module.Plans, action: Action.View, description: 'View plans' },
  { key: perm(Module.Plans, Action.Edit), module: Module.Plans, action: Action.Edit, description: 'Edit plans' },
  { key: perm(Module.Settings, Action.View), module: Module.Settings, action: Action.View, description: 'View system settings' },
  { key: perm(Module.Settings, Action.Edit), module: Module.Settings, action: Action.Edit, description: 'Edit system settings' },
  { key: perm(Module.Projects, Action.View), module: Module.Projects, action: Action.View, description: 'View projects' },
  { key: perm(Module.Projects, Action.Create), module: Module.Projects, action: Action.Create, description: 'Create projects' },
  { key: perm(Module.Projects, Action.Edit), module: Module.Projects, action: Action.Edit, description: 'Edit projects' },
  { key: perm(Module.Projects, Action.Delete), module: Module.Projects, action: Action.Delete, description: 'Delete projects' },
  { key: perm(Module.Billing, Action.Manage), module: Module.Billing, action: Action.Manage, description: 'Manage billing' },
]

const USER_ROLE_PERMISSIONS = [
  perm(Module.Projects, Action.View),
  perm(Module.Projects, Action.Create),
  perm(Module.Projects, Action.Edit),
  perm(Module.Projects, Action.Delete),
  perm(Module.Billing, Action.Manage),
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
