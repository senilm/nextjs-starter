/**
 * @file breadcrumbs.tsx
 * @module components/layouts/breadcrumbs
 * Auto-generated breadcrumbs from the current pathname.
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const LABEL_MAP: Record<string, string> = {
  dashboard: 'Dashboard',
  projects: 'Projects',
  settings: 'Settings',
  billing: 'Billing',
  admin: 'Admin',
  users: 'Users',
  roles: 'Roles',
  plans: 'Plans',
}

export const Breadcrumbs = (): React.ReactNode => {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length <= 1) return null

  const crumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const label = LABEL_MAP[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
    const isLast = index === segments.length - 1

    return { href, label, isLast }
  })

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => (
          <BreadcrumbItem key={crumb.href}>
            {index > 0 && <BreadcrumbSeparator />}
            {crumb.isLast ? (
              <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink asChild>
                <Link href={crumb.href}>{crumb.label}</Link>
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
