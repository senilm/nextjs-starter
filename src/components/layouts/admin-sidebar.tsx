/**
 * @file admin-sidebar.tsx
 * @module components/layouts/admin-sidebar
 * Admin sidebar with admin navigation, "Back to App" link, theme toggle, and user menu.
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft, Moon, Sun, Zap } from 'lucide-react'
import { useTheme } from 'next-themes'

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
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { UserMenu } from '@/components/layouts/user-menu'
import { usePermission } from '@/hooks/use-permission'
import { ADMIN_NAV, type NavItem } from '@/lib/navigation'
import { paths } from '@/lib/paths'
import { APP_NAME } from '@/lib/config'

export const AdminSidebar = (): React.ReactNode => {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const isActive = (href: string): boolean => {
    if (href === paths.admin.home()) return pathname === paths.admin.home()
    return pathname.startsWith(href)
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={paths.admin.home()}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Zap className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{APP_NAME}</span>
                  <span className="truncate text-xs text-muted-foreground">Admin Panel</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {ADMIN_NAV.map((group) => (
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

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Back to App">
                  <Link href={paths.dashboard.home()}>
                    <ArrowLeft />
                    <span>Back to App</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <div className="flex items-center justify-center px-2">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            <Sun className="size-3.5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-3.5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  )
}

interface NavLinkProps {
  item: NavItem
  isActive: boolean
}

const PermissionNavLink = ({ item, isActive }: NavLinkProps): React.ReactNode => {
  const hasAccess = usePermission(item.permission ?? '')
  if (item.permission && !hasAccess) return null

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
