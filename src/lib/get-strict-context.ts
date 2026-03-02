/**
 * @file get-strict-context.ts
 * @module lib/get-strict-context
 * Factory for creating type-safe React contexts with mandatory providers.
 */

import { createContext, useContext } from 'react'

export const getStrictContext = <T>(name: string): readonly [
  React.Provider<T | undefined>,
  () => T,
] => {
  const Context = createContext<T | undefined>(undefined)

  const useStrictContext = (): T => {
    const ctx = useContext(Context)
    if (!ctx) {
      throw new Error(`${name} is missing a Context Provider`)
    }
    return ctx
  }

  return [Context.Provider, useStrictContext] as const
}
