/**
 * @file theme-toggle.tsx
 * @module features/marketing/components/theme-toggle
 * Client component for toggling between light and dark mode with animated icon swap.
 */

'use client'

import { Moon, Sun } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'

interface ThemeToggleProps {
  size?: 'icon-sm' | 'icon'
}

export const ThemeToggle = ({ size = 'icon-sm' }: ThemeToggleProps): React.ReactNode => {
  const { setTheme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className="relative overflow-hidden"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="moon"
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Moon className="size-4" />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Sun className="size-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  )
}
