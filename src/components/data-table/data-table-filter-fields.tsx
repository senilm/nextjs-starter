/**
 * @file data-table-filter-fields.tsx
 * @module components/data-table/data-table-filter-fields
 * Individual filter field components: Select, String, and DateRange.
 */

'use client'

import { memo } from 'react'
import { CalendarIcon, X } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  parseDateFromISO,
  formatDateToISO,
  formatDateShort,
} from '@/lib/format'

export interface FilterField {
  key: string
  label: string
  type?: 'select' | 'string' | 'dateRange'
  placeholder?: string
  options?: { label: string; value: string }[]
  fromKey?: string
  toKey?: string
}

type FieldChangeHandler = (key: string, value: string) => void
type FieldClearHandler = (field: FilterField) => void

export const resolveFromKey = (field: FilterField): string =>
  field.fromKey ?? `${field.key}From`

export const resolveToKey = (field: FilterField): string =>
  field.toKey ?? `${field.key}To`

interface FieldHeaderProps {
  label: string
  isActive: boolean
  onClear: () => void
}

export const FieldHeader = ({ label, isActive, onClear }: FieldHeaderProps): React.ReactNode => (
  <div className="mb-1.5 flex items-center justify-between gap-2">
    <label className="truncate text-xs font-medium text-muted-foreground">
      {label}
    </label>
    {isActive && (
      <button
        type="button"
        className="shrink-0 rounded-sm p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={onClear}
      >
        <X className="h-3 w-3" />
      </button>
    )}
  </div>
)

interface SelectFieldProps {
  field: FilterField
  value: string
  onChange: FieldChangeHandler
  onClear: FieldClearHandler
}

export const SelectField = memo(
  ({ field, value, onChange, onClear }: SelectFieldProps): React.ReactNode => (
    <div>
      <FieldHeader
        label={field.label}
        isActive={!!value}
        onClear={() => onClear(field)}
      />
      <Select
        key={value ? 'active' : 'empty'}
        value={value || undefined}
        onValueChange={(val) => onChange(field.key, val)}
      >
        <SelectTrigger className="h-8 w-fit min-w-35">
          <SelectValue placeholder={field.placeholder ?? 'All'} />
        </SelectTrigger>
        <SelectContent>
          {field.options?.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ),
)
SelectField.displayName = 'SelectField'

interface StringFieldProps {
  field: FilterField
  value: string
  onChange: FieldChangeHandler
  onClear: FieldClearHandler
}

export const StringField = memo(
  ({ field, value, onChange, onClear }: StringFieldProps): React.ReactNode => (
    <div>
      <FieldHeader
        label={field.label}
        isActive={!!value}
        onClear={() => onClear(field)}
      />
      <Input
        className="h-8 w-fit min-w-35"
        placeholder={field.placeholder ?? `Enter ${field.label.toLowerCase()}`}
        value={value}
        onChange={(e) => onChange(field.key, e.target.value)}
      />
    </div>
  ),
)
StringField.displayName = 'StringField'

interface DateRangeFieldProps {
  field: FilterField
  fromDate: string
  toDate: string
  onChange: FieldChangeHandler
  onClear: FieldClearHandler
}

export const DateRangeField = memo(
  ({ field, fromDate, toDate, onChange, onClear }: DateRangeFieldProps): React.ReactNode => {
    const fromValueKey = resolveFromKey(field)
    const toValueKey = resolveToKey(field)
    const isActive = !!(fromDate || toDate)

    const selected: DateRange | undefined = isActive
      ? {
          from: fromDate ? parseDateFromISO(fromDate) : undefined,
          to: toDate ? parseDateFromISO(toDate) : undefined,
        }
      : undefined

    const label = isActive
      ? [
          fromDate ? formatDateShort(parseDateFromISO(fromDate)) : '',
          toDate ? formatDateShort(parseDateFromISO(toDate)) : '',
        ]
          .filter(Boolean)
          .join(' – ')
      : field.placeholder ?? 'Select range'

    return (
      <div>
        <FieldHeader
          label={field.label}
          isActive={isActive}
          onClear={() => onClear(field)}
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-fit min-w-35 justify-start font-normal"
            >
              <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{label}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <Calendar
              mode="range"
              selected={selected}
              onSelect={(range) => {
                onChange(
                  fromValueKey,
                  range?.from ? formatDateToISO(range.from) : '',
                )
                onChange(
                  toValueKey,
                  range?.to ? formatDateToISO(range.to) : '',
                )
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
    )
  },
)
DateRangeField.displayName = 'DateRangeField'
