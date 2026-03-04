/**
 * @file loading-transition.tsx
 * @module components/shared/loading-transition
 * Smooth fade transition between loading and content states.
 */

'use client'

import type { ReactNode } from 'react'

import { AnimatePresence, motion } from 'motion/react'

interface LoadingTransitionProps {
  isLoading: boolean
  loader: ReactNode
  children: ReactNode
  duration?: number
}

const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const LoadingTransition = ({
  isLoading,
  loader,
  children,
  duration = 0.2,
}: LoadingTransitionProps): ReactNode => {
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loader"
          initial={false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration }}
        >
          {loader}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          variants={fadeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
