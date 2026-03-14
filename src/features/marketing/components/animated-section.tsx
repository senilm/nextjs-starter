/**
 * @file animated-section.tsx
 * @module features/marketing/components/animated-section
 * Reusable motion wrapper with multiple animation variants on scroll.
 */

'use client'

import { motion } from 'motion/react'

const VARIANTS = {
  fadeUp: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } },
  fadeIn: { initial: { opacity: 0 }, animate: { opacity: 1 } },
  slideLeft: { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 } },
  slideRight: { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 } },
  scaleUp: { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } },
} as const

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
  variant?: keyof typeof VARIANTS
}

export const AnimatedSection = ({
  children,
  className,
  delay = 0,
  variant = 'fadeUp',
}: AnimatedSectionProps): React.ReactNode => {
  const v = VARIANTS[variant]

  return (
    <motion.div
      initial={v.initial}
      whileInView={v.animate}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
