/**
 * @file layout.tsx
 * @module app/(admin)/layout
 * Admin layout shell — admin sidebar + topbar + main content area.
 */

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/layouts/admin-sidebar'
import { DashboardTopbar } from '@/components/layouts/dashboard-topbar'

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>): React.ReactNode {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="h-svh overflow-hidden">
        <DashboardTopbar />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
