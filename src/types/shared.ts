/**
 * @file shared.ts
 * @module types/shared
 * Shared types used across multiple features.
 */

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
  code?: string
}
