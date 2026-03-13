/**
 * @file role-form-dialog.tsx
 * @module features/roles/components/role-form-dialog
 * Dialog for creating or editing a role with name, description, and permissions matrix.
 */

'use client'

import type { RoleWithPermissions } from '@/features/roles/types'

import { DialogShell } from '@/components/shared/dialog-shell'

interface RoleFormDialogProps {
  role: RoleWithPermissions | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const RoleFormDialog = ({ role, open, onOpenChange }: RoleFormDialogProps): React.ReactNode => {
  return (
    <DialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={role ? 'Edit Role' : 'Create Role'}
      description={role ? 'Update role details and permissions.' : 'Set up a new role with specific permissions.'}
      className="sm:max-w-2xl"
    >
      {open && (
        <RoleFormContent
          role={role}
          onClose={() => onOpenChange(false)}
        />
      )}
    </DialogShell>
  )
}

/* --- Inner form component that remounts when dialog opens, avoiding stale state --- */

import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DialogBody, DialogFooter } from '@/components/shared/dialog-shell'
import { useCreateRole, useUpdateRole } from '@/features/roles/hooks'
import { createRoleSchema, type CreateRoleInput } from '@/features/roles/validations'
import { PermissionsMatrix } from '@/features/roles/components/permissions-matrix'

interface RoleFormContentProps {
  role: RoleWithPermissions | null
  onClose: () => void
}

const RoleFormContent = ({ role, onClose }: RoleFormContentProps): React.ReactNode => {
  const isEditing = !!role
  const createMutation = useCreateRole()
  const updateMutation = useUpdateRole()

  const deriveInitialKeys = (): string[] => {
    if (!role) return []
    return [...role.permissionKeys]
  }

  const [selectedPermissionKeys, setSelectedPermissionKeys] = useState<string[]>(deriveInitialKeys)

  const form = useForm<CreateRoleInput>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: role?.name ?? '',
      description: role?.description ?? '',
      permissionKeys: [],
    },
  })

  const handleTogglePermission = useCallback((permissionKey: string): void => {
    setSelectedPermissionKeys((prev) =>
      prev.includes(permissionKey) ? prev.filter((k) => k !== permissionKey) : [...prev, permissionKey],
    )
  }, [])

  const onSubmit = async (data: CreateRoleInput): Promise<void> => {
    if (selectedPermissionKeys.length === 0) {
      form.setError('permissionKeys', { message: 'At least one permission is required' })
      return
    }

    if (isEditing && role) {
      const result = await updateMutation.mutateAsync({
        id: role.id,
        name: data.name,
        description: data.description,
        permissionKeys: selectedPermissionKeys,
      })
      if (result.success) onClose()
    } else {
      const result = await createMutation.mutateAsync({ ...data, permissionKeys: selectedPermissionKeys })
      if (result.success) onClose()
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending
  const isSystemRole = role?.isSystem ?? false

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <DialogBody className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isSystemRole} placeholder="Role name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Optional description" rows={2} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <FormLabel>Permissions</FormLabel>
            <ScrollArea className="h-64 rounded-md border p-4">
              <PermissionsMatrix
                selectedKeys={selectedPermissionKeys}
                onToggle={handleTogglePermission}
                disabled={isSystemRole}
              />
            </ScrollArea>
            {form.formState.errors.permissionKeys && (
              <p className="text-sm text-destructive">{form.formState.errors.permissionKeys.message}</p>
            )}
          </div>
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isPending}>
            {isEditing ? 'Update Role' : 'Create Role'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
