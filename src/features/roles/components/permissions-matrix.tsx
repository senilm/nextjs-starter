/**
 * @file permissions-matrix.tsx
 * @module features/roles/components/permissions-matrix
 * Checkbox grid grouped by module for assigning permissions to a role.
 */

'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { BlocksSkeleton } from '@/components/shared/loading-skeleton'
import { LoadingTransition } from '@/components/shared/loading-transition'
import { useAllPermissions } from '@/features/roles/hooks'

interface PermissionsMatrixProps {
  selectedKeys: string[]
  onToggle: (permissionKey: string) => void
  disabled?: boolean
}

export const PermissionsMatrix = ({
  selectedKeys,
  onToggle,
  disabled = false,
}: PermissionsMatrixProps): React.ReactNode => {
  const { data: groups, isLoading } = useAllPermissions()

  return (
    <LoadingTransition
      isLoading={isLoading || !groups}
      loader={<BlocksSkeleton count={4} height="h-20" gap="space-y-4" />}
    >
      {groups && (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.module} className="space-y-3">
              <h4 className="text-sm font-semibold capitalize">{group.module}</h4>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {group.permissions.map((perm) => (
                  <div key={perm.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={perm.key}
                      checked={selectedKeys.includes(perm.key)}
                      onCheckedChange={() => onToggle(perm.key)}
                      disabled={disabled}
                    />
                    <Label htmlFor={perm.key} className="text-sm font-normal">
                      {perm.action}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </LoadingTransition>
  )
}
