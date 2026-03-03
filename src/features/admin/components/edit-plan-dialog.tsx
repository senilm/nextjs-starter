/**
 * @file edit-plan-dialog.tsx
 * @module features/admin/components/edit-plan-dialog
 * Dialog for editing a plan — name, description, features, active toggle.
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useUpdatePlan } from '@/features/admin/hooks'
import { updatePlanSchema, type UpdatePlanInput } from '@/features/admin/validations'
import type { PlanWithStats } from '@/features/admin/types'

interface EditPlanDialogProps {
  plan: PlanWithStats | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const EditPlanDialog = ({ plan, open, onOpenChange }: EditPlanDialogProps): React.ReactNode => {
  const updateMutation = useUpdatePlan()
  const [newFeature, setNewFeature] = useState('')

  const form = useForm<UpdatePlanInput>({
    resolver: zodResolver(updatePlanSchema),
    defaultValues: { id: '', name: '', description: '', features: [], isActive: true },
  })

  useEffect(() => {
    if (plan) {
      form.reset({
        id: plan.id,
        name: plan.name,
        description: plan.description ?? '',
        features: plan.features,
        isActive: plan.isActive,
      })
    }
  }, [plan, form])

  const features = form.watch('features')

  const addFeature = useCallback((): void => {
    const trimmed = newFeature.trim()
    if (trimmed && !features.includes(trimmed)) {
      form.setValue('features', [...features, trimmed])
      setNewFeature('')
    }
  }, [newFeature, features, form])

  const removeFeature = useCallback(
    (index: number): void => {
      form.setValue(
        'features',
        features.filter((_, i) => i !== index),
      )
    },
    [features, form],
  )

  const onSubmit = async (data: UpdatePlanInput): Promise<void> => {
    const result = await updateMutation.mutateAsync(data)
    if (result.success) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Plan</DialogTitle>
          <DialogDescription>Update plan details and features.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Textarea {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Features</FormLabel>
              <div className="flex gap-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addFeature()
                    }
                  }}
                />
                <Button type="button" variant="outline" size="icon" onClick={addFeature}>
                  <Plus className="size-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {features.map((feature, index) => (
                  <Badge key={`feature-${index}`} variant="secondary" className="gap-1">
                    {feature}
                    <button type="button" onClick={() => removeFeature(index)} className="hover:text-destructive">
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <FormLabel className="cursor-pointer">Active</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={updateMutation.isPending}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
