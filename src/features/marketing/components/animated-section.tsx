/**
 * @file animated-section.tsx
 * @module features/marketing/components/animated-section
 * Reusable motion wrapper with fade-up animation on scroll.
 */

'use client'

import { motion } from 'motion/react'

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export const AnimatedSection = ({
  children,
  className,
  delay = 0,
}: AnimatedSectionProps): React.ReactNode => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
