/**
 * @file permissions-matrix.tsx
 * @module features/roles/components/permissions-matrix
 * Checkbox grid grouped by module for assigning permissions to a role.
 */

'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useAllPermissions } from '@/features/roles/hooks'

interface PermissionsMatrixProps {
  selectedIds: string[]
  onToggle: (permissionId: string) => void
  disabled?: boolean
}

export const PermissionsMatrix = ({
  selectedIds,
  onToggle,
  disabled = false,
}: PermissionsMatrixProps): React.ReactNode => {
  const { data: groups, isLoading } = useAllPermissions()

  if (isLoading || !groups) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={`perm-skel-${i}`} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.module} className="space-y-3">
          <h4 className="text-sm font-semibold capitalize">{group.module}</h4>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {group.permissions.map((perm) => (
              <div key={perm.id} className="flex items-center space-x-2">
                <Checkbox
                  id={perm.id}
                  checked={selectedIds.includes(perm.id)}
                  onCheckedChange={() => onToggle(perm.id)}
                  disabled={disabled}
                />
                <Label htmlFor={perm.id} className="text-sm font-normal">
                  {perm.action}
                </Label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
