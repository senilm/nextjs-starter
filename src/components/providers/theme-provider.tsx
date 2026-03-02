/**
 * @file theme-provider.tsx
 * @module components/providers/theme-provider
 * Next-themes wrapper for dark/light/system theme switching.
 */

'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps): React.ReactNode => {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  )
}
