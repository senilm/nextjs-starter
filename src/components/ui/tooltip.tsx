/**
 * @file tooltip.tsx
 * @module components/ui/tooltip
 * Tooltip component with scale/fade animation via motion.
 */

'use client'

import * as React from 'react'
import { Tooltip as TooltipPrimitive } from 'radix-ui'
import { AnimatePresence, motion } from 'motion/react'

import { cn } from '@/lib/utils'
import { getStrictContext } from '@/lib/get-strict-context'
import { useControlledState } from '@/hooks/use-controlled-state'

// --- Context ---

type TooltipContextType = {
  isOpen: boolean
}

const [TooltipCtxProvider, useTooltipCtx] = getStrictContext<TooltipContextType>('TooltipContext')

// --- Provider ---

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>): React.ReactNode {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

// --- Root ---

function Tooltip(props: React.ComponentProps<typeof TooltipPrimitive.Root>): React.ReactNode {
  const [isOpen, setIsOpen] = useControlledState({
    value: props.open,
    defaultValue: props.defaultOpen,
    onChange: props.onOpenChange,
  })

  return (
    <TooltipCtxProvider value={{ isOpen }}>
      <TooltipPrimitive.Root
        data-slot="tooltip"
        {...props}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </TooltipCtxProvider>
  )
}

// --- Trigger ---

function TooltipTrigger(props: React.ComponentProps<typeof TooltipPrimitive.Trigger>): React.ReactNode {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

// --- Content ---

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>): React.ReactNode {
  const { isOpen } = useTooltipCtx()

  return (
    <AnimatePresence>
      {isOpen && (
        <TooltipPrimitive.Portal forceMount>
          <TooltipPrimitive.Content
            data-slot="tooltip-content"
            sideOffset={sideOffset}
            asChild
            forceMount
            {...props}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1, ease: 'easeOut' }}
              className={cn(
                'bg-foreground text-background z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance',
                className,
              )}
            >
              {children}
              <TooltipPrimitive.Arrow className="bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%-2px)]] rotate-45 rounded-[2px]" />
            </motion.div>
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      )}
    </AnimatePresence>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
