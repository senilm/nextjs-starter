/**
 * @file dropdown-menu.tsx
 * @module components/ui/dropdown-menu
 * Dropdown menu with animated highlight hover system and spring transitions.
 */

"use client"

import * as React from "react"
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui"
import { AnimatePresence, motion, type HTMLMotionProps } from "motion/react"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { getStrictContext } from "@/lib/get-strict-context"
import { useControlledState } from "@/hooks/use-controlled-state"
import { useDataState } from "@/hooks/use-data-state"
import {
  Highlight,
  HighlightItem,
  type HighlightItemProps,
  type HighlightProps,
} from "@/components/ui/highlight"

// --- Context ---

type DropdownMenuContextType = {
  isOpen: boolean
  setIsOpen: (o: boolean) => void
  highlightedValue: string | null
  setHighlightedValue: (value: string | null) => void
}

type DropdownMenuSubContextType = {
  isOpen: boolean
  setIsOpen: (o: boolean) => void
}

const [DropdownMenuProvider, useDropdownMenu] =
  getStrictContext<DropdownMenuContextType>("DropdownMenuContext")

const [DropdownMenuSubProvider, useDropdownMenuSub] =
  getStrictContext<DropdownMenuSubContextType>("DropdownMenuSubContext")

// --- Root ---

function DropdownMenu(
  props: React.ComponentProps<typeof DropdownMenuPrimitive.Root>
): React.ReactNode {
  const [isOpen, setIsOpen] = useControlledState({
    value: props?.open,
    defaultValue: props?.defaultOpen,
    onChange: props?.onOpenChange,
  })
  const [highlightedValue, setHighlightedValue] = React.useState<string | null>(
    null
  )

  return (
    <DropdownMenuProvider
      value={{ isOpen, setIsOpen, highlightedValue, setHighlightedValue }}
    >
      <DropdownMenuPrimitive.Root
        data-slot="dropdown-menu"
        {...props}
        onOpenChange={setIsOpen}
      />
    </DropdownMenuProvider>
  )
}

// --- Trigger ---

function DropdownMenuTrigger(
  props: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>
): React.ReactNode {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  )
}

// --- Portal ---

function DropdownMenuPortal(
  props: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>
): React.ReactNode {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  )
}

// --- Highlight wrapper ---

type DropdownMenuHighlightProps = Omit<
  HighlightProps,
  "controlledItems" | "enabled" | "hover"
> & {
  animateOnHover?: boolean
}

function DropdownMenuHighlight({
  transition = { type: "spring", stiffness: 350, damping: 35 },
  ...props
}: DropdownMenuHighlightProps): React.ReactNode {
  const { highlightedValue } = useDropdownMenu()

  return (
    <Highlight
      data-slot="dropdown-menu-highlight"
      mode="parent"
      click={false}
      controlledItems
      transition={transition}
      value={highlightedValue}
      exitDelay={0}
      {...props}
    />
  )
}

// --- Content ---

type DropdownMenuContentProps = Omit<
  React.ComponentProps<typeof DropdownMenuPrimitive.Content>,
  "forceMount" | "asChild"
> &
  Omit<
    React.ComponentProps<typeof DropdownMenuPrimitive.Portal>,
    "forceMount"
  > &
  HTMLMotionProps<"div">

function DropdownMenuContent({
  loop,
  onCloseAutoFocus,
  onEscapeKeyDown,
  onPointerDownOutside,
  onFocusOutside,
  onInteractOutside,
  side,
  sideOffset = 4,
  align,
  alignOffset,
  avoidCollisions,
  collisionBoundary,
  collisionPadding,
  arrowPadding,
  sticky,
  hideWhenDetached,
  transition = { duration: 0.2 },
  style,
  container,
  className,
  children,
  ...props
}: DropdownMenuContentProps): React.ReactNode {
  const { isOpen } = useDropdownMenu()

  return (
    <AnimatePresence>
      {isOpen && (
        <DropdownMenuPortal forceMount container={container}>
          <DropdownMenuPrimitive.Content
            asChild
            loop={loop}
            onCloseAutoFocus={onCloseAutoFocus}
            onEscapeKeyDown={onEscapeKeyDown}
            onPointerDownOutside={onPointerDownOutside}
            onFocusOutside={onFocusOutside}
            onInteractOutside={onInteractOutside}
            side={side}
            sideOffset={sideOffset}
            align={align}
            alignOffset={alignOffset}
            avoidCollisions={avoidCollisions}
            collisionBoundary={collisionBoundary}
            collisionPadding={collisionPadding}
            arrowPadding={arrowPadding}
            sticky={sticky}
            hideWhenDetached={hideWhenDetached}
          >
            <motion.div
              key="dropdown-menu-content"
              data-slot="dropdown-menu-content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={transition}
              style={{ willChange: "opacity, transform", ...style }}
              className={cn(
                "bg-popover text-popover-foreground z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md outline-none",
                className
              )}
              {...props}
            >
              <DropdownMenuHighlight className="bg-accent rounded-sm">
                {children}
              </DropdownMenuHighlight>
            </motion.div>
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPortal>
      )}
    </AnimatePresence>
  )
}

// --- Group ---

function DropdownMenuGroup(
  props: React.ComponentProps<typeof DropdownMenuPrimitive.Group>
): React.ReactNode {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  )
}

// --- Highlight Item ---

function DropdownMenuHighlightItem(props: HighlightItemProps): React.ReactNode {
  return <HighlightItem data-slot="dropdown-menu-highlight-item" {...props} />
}

// --- Item ---

type DropdownMenuItemProps = Omit<
  React.ComponentProps<typeof DropdownMenuPrimitive.Item>,
  "asChild"
> &
  HTMLMotionProps<"div"> & {
    inset?: boolean
    variant?: "default" | "destructive"
  }

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  disabled,
  onSelect,
  textValue,
  ...props
}: DropdownMenuItemProps): React.ReactNode {
  const { setHighlightedValue } = useDropdownMenu()
  const [, highlightedRef] = useDataState<HTMLDivElement>(
    "highlighted",
    undefined,
    (value) => {
      if (value === true) {
        const el = highlightedRef.current
        const v = el?.dataset.value || el?.id || null
        if (v) setHighlightedValue(v)
      }
    }
  )

  return (
    <DropdownMenuHighlightItem
      activeClassName={
        variant === "destructive"
          ? "bg-destructive/10 dark:bg-destructive/20"
          : ""
      }
      disabled={disabled}
    >
      <DropdownMenuPrimitive.Item
        ref={highlightedRef}
        disabled={disabled}
        onSelect={onSelect}
        textValue={textValue}
        asChild
      >
        <motion.div
          data-slot="dropdown-menu-item"
          data-inset={inset}
          data-variant={variant}
          data-disabled={disabled}
          className={cn(
            "focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            className
          )}
          {...props}
        />
      </DropdownMenuPrimitive.Item>
    </DropdownMenuHighlightItem>
  )
}

// --- Checkbox Item ---

type DropdownMenuCheckboxItemProps = Omit<
  React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>,
  "asChild"
> &
  HTMLMotionProps<"div">

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  onCheckedChange,
  disabled,
  onSelect,
  textValue,
  ...props
}: DropdownMenuCheckboxItemProps): React.ReactNode {
  const { setHighlightedValue } = useDropdownMenu()
  const [, highlightedRef] = useDataState<HTMLDivElement>(
    "highlighted",
    undefined,
    (value) => {
      if (value === true) {
        const el = highlightedRef.current
        const v = el?.dataset.value || el?.id || null
        if (v) setHighlightedValue(v)
      }
    }
  )

  return (
    <DropdownMenuHighlightItem disabled={disabled}>
      <DropdownMenuPrimitive.CheckboxItem
        ref={highlightedRef}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        onSelect={onSelect}
        textValue={textValue}
        asChild
      >
        <motion.div
          data-slot="dropdown-menu-checkbox-item"
          data-disabled={disabled}
          className={cn(
            "focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            className
          )}
          {...props}
        >
          <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
            <DropdownMenuPrimitive.ItemIndicator asChild>
              <motion.div
                data-slot="dropdown-menu-item-indicator"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <CheckIcon className="size-4" />
              </motion.div>
            </DropdownMenuPrimitive.ItemIndicator>
          </span>
          {children}
        </motion.div>
      </DropdownMenuPrimitive.CheckboxItem>
    </DropdownMenuHighlightItem>
  )
}

// --- Radio Group ---

function DropdownMenuRadioGroup(
  props: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>
): React.ReactNode {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

// --- Radio Item ---

type DropdownMenuRadioItemProps = Omit<
  React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>,
  "asChild"
> &
  HTMLMotionProps<"div">

function DropdownMenuRadioItem({
  className,
  children,
  value,
  disabled,
  onSelect,
  textValue,
  ...props
}: DropdownMenuRadioItemProps): React.ReactNode {
  const { setHighlightedValue } = useDropdownMenu()
  const [, highlightedRef] = useDataState<HTMLDivElement>(
    "highlighted",
    undefined,
    (value) => {
      if (value === true) {
        const el = highlightedRef.current
        const v = el?.dataset.value || el?.id || null
        if (v) setHighlightedValue(v)
      }
    }
  )

  return (
    <DropdownMenuHighlightItem disabled={disabled}>
      <DropdownMenuPrimitive.RadioItem
        ref={highlightedRef}
        value={value}
        disabled={disabled}
        onSelect={onSelect}
        textValue={textValue}
        asChild
      >
        <motion.div
          data-slot="dropdown-menu-radio-item"
          data-disabled={disabled}
          className={cn(
            "focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            className
          )}
          {...props}
        >
          <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
            <DropdownMenuPrimitive.ItemIndicator asChild>
              <motion.div
                data-slot="dropdown-menu-item-indicator"
                layoutId="dropdown-menu-item-indicator-radio"
              >
                <CircleIcon className="size-2 fill-current" />
              </motion.div>
            </DropdownMenuPrimitive.ItemIndicator>
          </span>
          {children}
        </motion.div>
      </DropdownMenuPrimitive.RadioItem>
    </DropdownMenuHighlightItem>
  )
}

// --- Label ---

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}): React.ReactNode {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  )
}

// --- Separator ---

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>): React.ReactNode {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

// --- Shortcut ---

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">): React.ReactNode {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

// --- Sub ---

function DropdownMenuSub(
  props: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>
): React.ReactNode {
  const [isOpen, setIsOpen] = useControlledState({
    value: props?.open,
    defaultValue: props?.defaultOpen,
    onChange: props?.onOpenChange,
  })

  return (
    <DropdownMenuSubProvider value={{ isOpen, setIsOpen }}>
      <DropdownMenuPrimitive.Sub
        data-slot="dropdown-menu-sub"
        {...props}
        onOpenChange={setIsOpen}
      />
    </DropdownMenuSubProvider>
  )
}

// --- Sub Trigger ---

type DropdownMenuSubTriggerProps = Omit<
  React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger>,
  "asChild"
> &
  HTMLMotionProps<"div"> & {
    inset?: boolean
  }

function DropdownMenuSubTrigger({
  disabled,
  textValue,
  className,
  inset,
  children,
  ...props
}: DropdownMenuSubTriggerProps): React.ReactNode {
  const { setHighlightedValue } = useDropdownMenu()
  const [, highlightedRef] = useDataState<HTMLDivElement>(
    "highlighted",
    undefined,
    (value) => {
      if (value === true) {
        const el = highlightedRef.current
        const v = el?.dataset.value || el?.id || null
        if (v) setHighlightedValue(v)
      }
    }
  )

  return (
    <DropdownMenuHighlightItem disabled={disabled}>
      <DropdownMenuPrimitive.SubTrigger
        ref={highlightedRef}
        disabled={disabled}
        textValue={textValue}
        asChild
      >
        <motion.div
          data-slot="dropdown-menu-sub-trigger"
          data-disabled={disabled}
          data-inset={inset}
          className={cn(
            "focus:text-accent-foreground data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8",
            "data-[state=open]:[&_[data-slot=chevron]]:rotate-90 [&_[data-slot=chevron]]:transition-transform [&_[data-slot=chevron]]:duration-300 [&_[data-slot=chevron]]:ease-in-out",
            className
          )}
          {...props}
        >
          {children}
          <ChevronRightIcon data-slot="chevron" className="ml-auto size-4" />
        </motion.div>
      </DropdownMenuPrimitive.SubTrigger>
    </DropdownMenuHighlightItem>
  )
}

// --- Sub Content ---

type DropdownMenuSubContentProps = Omit<
  React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>,
  "forceMount" | "asChild"
> &
  Omit<
    React.ComponentProps<typeof DropdownMenuPrimitive.Portal>,
    "forceMount"
  > &
  HTMLMotionProps<"div">

function DropdownMenuSubContent({
  loop,
  onEscapeKeyDown,
  onPointerDownOutside,
  onFocusOutside,
  onInteractOutside,
  sideOffset,
  alignOffset,
  avoidCollisions,
  collisionBoundary,
  collisionPadding,
  arrowPadding,
  sticky,
  hideWhenDetached,
  transition = { duration: 0.2 },
  style,
  container,
  className,
  ...props
}: DropdownMenuSubContentProps): React.ReactNode {
  const { isOpen } = useDropdownMenuSub()

  return (
    <AnimatePresence>
      {isOpen && (
        <DropdownMenuPortal forceMount container={container}>
          <DropdownMenuPrimitive.SubContent
            asChild
            forceMount
            loop={loop}
            onEscapeKeyDown={onEscapeKeyDown}
            onPointerDownOutside={onPointerDownOutside}
            onFocusOutside={onFocusOutside}
            onInteractOutside={onInteractOutside}
            sideOffset={sideOffset}
            alignOffset={alignOffset}
            avoidCollisions={avoidCollisions}
            collisionBoundary={collisionBoundary}
            collisionPadding={collisionPadding}
            arrowPadding={arrowPadding}
            sticky={sticky}
            hideWhenDetached={hideWhenDetached}
          >
            <motion.div
              key="dropdown-menu-sub-content"
              data-slot="dropdown-menu-sub-content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={transition}
              style={{ willChange: "opacity, transform", ...style }}
              className={cn(
                "bg-popover text-popover-foreground z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg outline-none",
                className
              )}
              {...props}
            />
          </DropdownMenuPrimitive.SubContent>
        </DropdownMenuPortal>
      )}
    </AnimatePresence>
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
