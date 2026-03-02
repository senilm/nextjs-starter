/**
 * @file layout.tsx
 * @module app/(dashboard)/layout
 * Dashboard layout shell — sidebar + topbar + main content area.
 */

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { DashboardSidebar } from '@/components/layouts/dashboard-sidebar'
import { DashboardTopbar } from '@/components/layouts/dashboard-topbar'

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>): React.ReactNode {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <DashboardTopbar />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
