/**
 * @file popover.tsx
 * @module components/ui/popover
 * Popover component with spring scale animation and AnimatePresence.
 */

"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"
import { AnimatePresence, motion, type HTMLMotionProps } from "motion/react"

import { cn } from "@/lib/utils"
import { getStrictContext } from "@/lib/get-strict-context"
import { useControlledState } from "@/hooks/use-controlled-state"

// --- Context ---

type PopoverContextType = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const [PopoverProvider, usePopover] =
  getStrictContext<PopoverContextType>("PopoverContext")

// --- Root ---

function Popover(props: React.ComponentProps<typeof PopoverPrimitive.Root>): React.ReactNode {
  const [isOpen, setIsOpen] = useControlledState({
    value: props?.open,
    defaultValue: props?.defaultOpen,
    onChange: props?.onOpenChange,
  })

  return (
    <PopoverProvider value={{ isOpen, setIsOpen }}>
      <PopoverPrimitive.Root
        data-slot="popover"
        {...props}
        onOpenChange={setIsOpen}
      />
    </PopoverProvider>
  )
}

// --- Trigger ---

function PopoverTrigger(
  props: React.ComponentProps<typeof PopoverPrimitive.Trigger>
): React.ReactNode {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

// --- Portal ---

function PopoverPortal(
  props: Omit<
    React.ComponentProps<typeof PopoverPrimitive.Portal>,
    "forceMount"
  >
): React.ReactNode {
  const { isOpen } = usePopover()

  return (
    <AnimatePresence>
      {isOpen && (
        <PopoverPrimitive.Portal
          forceMount
          data-slot="popover-portal"
          {...props}
        />
      )}
    </AnimatePresence>
  )
}

// --- Content ---

type PopoverContentProps = Omit<
  React.ComponentProps<typeof PopoverPrimitive.Content>,
  "forceMount" | "asChild"
> &
  HTMLMotionProps<"div">

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  onOpenAutoFocus,
  onCloseAutoFocus,
  onEscapeKeyDown,
  onPointerDownOutside,
  onFocusOutside,
  onInteractOutside,
  alignOffset,
  side,
  avoidCollisions,
  collisionBoundary,
  collisionPadding,
  arrowPadding,
  sticky,
  hideWhenDetached,
  transition = { type: "spring", stiffness: 300, damping: 25 },
  ...props
}: PopoverContentProps): React.ReactNode {
  return (
    <PopoverPortal>
      <PopoverPrimitive.Content
        asChild
        forceMount
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        avoidCollisions={avoidCollisions}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
        arrowPadding={arrowPadding}
        sticky={sticky}
        hideWhenDetached={hideWhenDetached}
        onOpenAutoFocus={onOpenAutoFocus}
        onCloseAutoFocus={onCloseAutoFocus}
        onEscapeKeyDown={onEscapeKeyDown}
        onPointerDownOutside={onPointerDownOutside}
        onInteractOutside={onInteractOutside}
        onFocusOutside={onFocusOutside}
      >
        <motion.div
          key="popover-content"
          data-slot="popover-content"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={transition}
          className={cn(
            "bg-popover text-popover-foreground z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
            className
          )}
          {...props}
        />
      </PopoverPrimitive.Content>
    </PopoverPortal>
  )
}

// --- Anchor ---

function PopoverAnchor(
  props: React.ComponentProps<typeof PopoverPrimitive.Anchor>
): React.ReactNode {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

// --- Layout helpers ---

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">): React.ReactNode {
  return (
    <div
      data-slot="popover-header"
      className={cn("flex flex-col gap-1 text-sm", className)}
      {...props}
    />
  )
}

function PopoverTitle({ className, ...props }: React.ComponentProps<"h2">): React.ReactNode {
  return (
    <div
      data-slot="popover-title"
      className={cn("font-medium", className)}
      {...props}
    />
  )
}

function PopoverDescription({
  className,
  ...props
}: React.ComponentProps<"p">): React.ReactNode {
  return (
    <p
      data-slot="popover-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
}
