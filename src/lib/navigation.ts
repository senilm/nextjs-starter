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
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { title: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
    ],
  },
  {
    label: 'Account',
    items: [
      { title: 'Settings', href: '/dashboard/settings', icon: Settings },
      { title: 'Billing', href: '/dashboard/billing', icon: CreditCard },
    ],
  },
]

export const ADMIN_NAV: NavGroup[] = [
  {
    label: 'Administration',
    items: [
      { title: 'Overview', href: '/admin', icon: BarChart3, permission: 'admin.access' },
      { title: 'Users', href: '/admin/users', icon: Users, permission: 'users.view' },
      { title: 'Roles', href: '/admin/roles', icon: Shield, permission: 'roles.view' },
      { title: 'Plans', href: '/admin/plans', icon: Palette, permission: 'plans.view' },
      { title: 'Settings', href: '/admin/settings', icon: Settings, permission: 'settings.view' },
    ],
  },
]
