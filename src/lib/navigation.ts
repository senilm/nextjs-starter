/**
 * @file navigation.ts
 * @module lib/navigation
 * Sidebar navigation configuration for dashboard and admin areas.
 */

import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  CreditCard,
  Shield,
  Users,
  Palette,
  BarChart3,
  type LucideIcon,
} from 'lucide-react'

import { paths } from '@/lib/paths'

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  permission?: string
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const DASHBOARD_NAV: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { title: 'Dashboard', href: paths.dashboard.home(), icon: LayoutDashboard },
      { title: 'Projects', href: paths.dashboard.projects.list(), icon: FolderKanban },
    ],
  },
  {
    label: 'Account',
    items: [
      { title: 'Settings', href: paths.dashboard.settings(), icon: Settings },
      { title: 'Billing', href: paths.dashboard.billing(), icon: CreditCard },
    ],
  },
]

export const ADMIN_NAV: NavGroup[] = [
  {
    label: 'Administration',
    items: [
      { title: 'Overview', href: paths.admin.home(), icon: BarChart3, permission: 'admin.access' },
      { title: 'Users', href: paths.admin.users(), icon: Users, permission: 'users.view' },
      { title: 'Roles', href: paths.admin.roles(), icon: Shield, permission: 'roles.view' },
      { title: 'Plans', href: paths.admin.plans(), icon: Palette, permission: 'plans.view' },
      { title: 'Settings', href: paths.admin.settings(), icon: Settings, permission: 'settings.view' },
    ],
  },
]
