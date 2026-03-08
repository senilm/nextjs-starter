/**
 * @file dashboard-sidebar.tsx
 * @module components/layouts/dashboard-sidebar
 * Main sidebar with navigation and user menu.
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Zap } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { UserMenu } from '@/components/layouts/user-menu'
import { usePermission } from '@/hooks/use-permission'
import { DASHBOARD_NAV, ADMIN_NAV, type NavItem } from '@/lib/navigation'
import { paths } from '@/lib/paths'
import { APP_NAME } from '@/lib/config'

export const DashboardSidebar = (): React.ReactNode => {
  const pathname = usePathname()
  const hasAdminAccess = usePermission('admin.access')

  const isActive = (href: string): boolean => {
    if (href === paths.dashboard.home()) return pathname === paths.dashboard.home()
    return pathname.startsWith(href)
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={paths.dashboard.home()}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Zap className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{APP_NAME}</span>
                  <span className="truncate text-xs text-muted-foreground">Starter Kit</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {DASHBOARD_NAV.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <NavLink key={item.href} item={item} isActive={isActive(item.href)} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {hasAdminAccess &&
          ADMIN_NAV.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <PermissionNavLink key={item.href} item={item} isActive={isActive(item.href)} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
      </SidebarContent>

      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  )
}

interface NavLinkProps {
  item: NavItem
  isActive: boolean
}

const NavLink = ({ item, isActive }: NavLinkProps): React.ReactNode => {
  const Icon = item.icon
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
        <Link href={item.href}>
          <Icon />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

const PermissionNavLink = ({ item, isActive }: NavLinkProps): React.ReactNode => {
  const hasAccess = usePermission(item.permission ?? '')
  if (item.permission && !hasAccess) return null

  return <NavLink item={item} isActive={isActive} />
}
