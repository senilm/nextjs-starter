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

const CURRENCY_DECIMALS: Record<string, number> = {
  usd: 2,
  eur: 2,
  gbp: 2,
  inr: 2,
  jpy: 0,
}

export const formatPaymentAmount = (amountInSmallestUnit: number, currency: string): string => {
  const decimals = CURRENCY_DECIMALS[currency.toLowerCase()] ?? 2
  const divisor = Math.pow(10, decimals)
  const amount = amountInSmallestUnit / divisor

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: decimals,
  }).format(amount)
}

export const formatCurrency = (
  value?: number | null,
  options: { currency?: string; compact?: boolean } = {},
): string => {
  if (value === null || value === undefined) return '\u2014'
  const { currency = 'USD', compact = false } = options
  if (compact && value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (compact && value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}
