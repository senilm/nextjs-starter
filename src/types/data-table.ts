/**
 * @file data-table.ts
 * @module types/data-table
 * Shared types and constants for DataTable components.
 */

export const VIEW_MODE = {
  LIST: 'list',
  GRID: 'grid',
} as const

export type ViewMode = (typeof VIEW_MODE)[keyof typeof VIEW_MODE]
