/**
 * @file global-search.tsx
 * @module components/layouts/global-search
 * Command palette with Cmd+K shortcut for navigation and quick actions.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  LayoutDashboard,
  FolderKanban,
  Settings,
  CreditCard,
  Shield,
  Users,
  Plus,
} from 'lucide-react'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { usePermission } from '@/hooks/use-permission'

interface CommandAction {
  label: string
  icon: React.ElementType
  path: string
  permission?: string
}

const NAVIGATION_ACTIONS: CommandAction[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Projects', icon: FolderKanban, path: '/dashboard/projects' },
  { label: 'Settings', icon: Settings, path: '/dashboard/settings' },
  { label: 'Billing', icon: CreditCard, path: '/dashboard/billing' },
  { label: 'Admin Panel', icon: Shield, path: '/admin', permission: 'admin.access' },
  { label: 'Manage Users', icon: Users, path: '/admin/users', permission: 'users.view' },
  { label: 'Manage Roles', icon: Shield, path: '/admin/roles', permission: 'roles.view' },
]

const QUICK_ACTIONS: CommandAction[] = [
  { label: 'Create Project', icon: Plus, path: '/dashboard/projects' },
]

export const GlobalSearch = (): React.ReactNode => {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const handleSelect = useCallback(
    (path: string): void => {
      setOpen(false)
      router.push(path)
    },
    [router],
  )

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-8 w-full max-w-56 items-center gap-2 rounded-md border border-input bg-background px-2.5 text-sm text-muted-foreground shadow-xs transition-colors hover:bg-accent/50"
      >
        <Search className="size-3.5 shrink-0" />
        <span className="flex-1 text-left text-xs">Search...</span>
        <kbd className="pointer-events-none hidden h-5 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        showCloseButton={false}
      >
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            {NAVIGATION_ACTIONS.map((action) => (
              <PermissionGatedItem key={action.path} action={action} onSelect={handleSelect} />
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Quick Actions">
            {QUICK_ACTIONS.map((action) => (
              <PermissionGatedItem key={action.label} action={action} onSelect={handleSelect} />
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

interface PermissionGatedItemProps {
  action: CommandAction
  onSelect: (path: string) => void
}

const PermissionGatedItem = ({ action, onSelect }: PermissionGatedItemProps): React.ReactNode => {
  const hasAccess = usePermission(action.permission ?? '')
  if (action.permission && !hasAccess) return null

  const Icon = action.icon

  return (
    <CommandItem value={action.label} onSelect={() => onSelect(action.path)}>
      <Icon />
      <span>{action.label}</span>
    </CommandItem>
  )
}
