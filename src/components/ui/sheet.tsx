/**
 * @file sheet.tsx
 * @module components/ui/sheet
 * Sheet (slide-over panel) with blur backdrop and spring-based directional slides.
 */

"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "radix-ui"
import { AnimatePresence, motion, type HTMLMotionProps } from "motion/react"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { getStrictContext } from "@/lib/get-strict-context"
import { useControlledState } from "@/hooks/use-controlled-state"

// --- Context ---

type SheetContextType = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const [SheetProvider, useSheet] =
  getStrictContext<SheetContextType>("SheetContext")

// --- Primitives ---

function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>): React.ReactNode {
  const [isOpen, setIsOpen] = useControlledState({
    value: props.open,
    defaultValue: props.defaultOpen,
    onChange: props.onOpenChange,
  })

  return (
    <SheetProvider value={{ isOpen, setIsOpen }}>
      <SheetPrimitive.Root
        data-slot="sheet"
        {...props}
        onOpenChange={setIsOpen}
      />
    </SheetProvider>
  )
}

function SheetTrigger(
  props: React.ComponentProps<typeof SheetPrimitive.Trigger>
): React.ReactNode {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose(
  props: React.ComponentProps<typeof SheetPrimitive.Close>
): React.ReactNode {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal(
  props: React.ComponentProps<typeof SheetPrimitive.Portal>
): React.ReactNode {
  const { isOpen } = useSheet()

  return (
    <AnimatePresence>
      {isOpen && (
        <SheetPrimitive.Portal forceMount data-slot="sheet-portal" {...props} />
      )}
    </AnimatePresence>
  )
}

function SheetOverlay({
  className,
  transition = { duration: 0.2, ease: "easeInOut" },
  ...props
}: Omit<
  React.ComponentProps<typeof SheetPrimitive.Overlay>,
  "asChild" | "forceMount"
> &
  HTMLMotionProps<"div">): React.ReactNode {
  return (
    <SheetPrimitive.Overlay asChild forceMount>
      <motion.div
        key="sheet-overlay"
        data-slot="sheet-overlay"
        className={cn("fixed inset-0 z-50 bg-black/50", className)}
        initial={{ opacity: 0, filter: "blur(4px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, filter: "blur(4px)" }}
        transition={transition}
        {...props}
      />
    </SheetPrimitive.Overlay>
  )
}

// --- Content ---

type Side = "top" | "right" | "bottom" | "left"

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  transition = { type: "spring", stiffness: 150, damping: 22 },
  style,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> &
  HTMLMotionProps<"div"> & {
    side?: Side
    showCloseButton?: boolean
  }): React.ReactNode {
  const axis = side === "left" || side === "right" ? "x" : "y"

  const offscreen: Record<Side, { x?: string; y?: string; opacity: number }> = {
    right: { x: "100%", opacity: 0 },
    left: { x: "-100%", opacity: 0 },
    top: { y: "-100%", opacity: 0 },
    bottom: { y: "100%", opacity: 0 },
  }

  const positionStyle: Record<Side, React.CSSProperties> = {
    right: { insetBlock: 0, right: 0 },
    left: { insetBlock: 0, left: 0 },
    top: { insetInline: 0, top: 0 },
    bottom: { insetInline: 0, bottom: 0 },
  }

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content asChild forceMount {...props}>
        <motion.div
          key="sheet-content"
          data-slot="sheet-content"
          data-side={side}
          className={cn(
            "bg-background fixed z-50 flex flex-col gap-4 shadow-lg",
            side === "right" && "h-full w-3/4 border-l sm:max-w-sm",
            side === "left" && "h-full w-3/4 border-r sm:max-w-sm",
            side === "top" && "w-full border-b",
            side === "bottom" && "w-full border-t",
            className
          )}
          initial={offscreen[side]}
          animate={{ [axis]: 0, opacity: 1 }}
          exit={offscreen[side]}
          style={{
            position: "fixed",
            ...positionStyle[side],
            ...style,
          }}
          transition={transition}
        >
          {children}
          {showCloseButton && (
            <SheetClose className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
              <XIcon className="size-4" />
              <span className="sr-only">Close</span>
            </SheetClose>
          )}
        </motion.div>
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

// --- Layout pieces ---

function SheetHeader({ className, ...props }: React.ComponentProps<"div">): React.ReactNode {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">): React.ReactNode {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>): React.ReactNode {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>): React.ReactNode {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
