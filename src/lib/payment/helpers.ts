/**
 * @file helpers.ts
 * @module lib/payment/helpers
 * Provider-agnostic payment utility functions.
 */

const CURRENCY_DECIMALS: Record<string, number> = {
  usd: 2,
  eur: 2,
  gbp: 2,
  inr: 2,
  jpy: 0,
}

export function formatAmount(amountInSmallestUnit: number, currency: string): string {
  const decimals = CURRENCY_DECIMALS[currency.toLowerCase()] ?? 2
  const divisor = Math.pow(10, decimals)
  const amount = amountInSmallestUnit / divisor

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: decimals,
  }).format(amount)
}

export function getSmallestUnitAmount(amount: number, currency: string): number {
  const decimals = CURRENCY_DECIMALS[currency.toLowerCase()] ?? 2
  return Math.round(amount * Math.pow(10, decimals))
}

export function getCurrencySymbol(currency: string): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(0)
  return formatted.replace(/\d/g, '').trim()
}
