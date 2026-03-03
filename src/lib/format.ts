/**
 * @file format.ts
 * @module lib/format
 * Date and string formatting utilities.
 */

import { format, formatDistanceToNow } from 'date-fns'

export const formatDate = (date: string | Date, pattern = 'dd MMM, yyyy'): string => {
  return format(new Date(date), pattern)
}

export const formatDateTime = (date: string | Date): string => {
  return format(new Date(date), "dd MMM, yyyy 'at' h:mm a")
}

export const formatRelativeTime = (date: string | Date): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export const parseDateFromISO = (isoDateStr: string): Date =>
  new Date(isoDateStr + 'T00:00:00')

export const formatDateToISO = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const formatDateShort = (date: Date): string =>
  new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
