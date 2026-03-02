/**
 * @file dashboard-topbar.tsx
 * @module components/layouts/dashboard-topbar
 * Top bar with sidebar trigger and breadcrumbs.
 */

'use client'

import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Breadcrumbs } from '@/components/layouts/breadcrumbs'
import { GlobalSearch } from '@/components/layouts/global-search'

export const DashboardTopbar = (): React.ReactNode => {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumbs />
      </div>
      <GlobalSearch />
    </header>
  )
}
