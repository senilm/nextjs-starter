/**
 * @file tabs.tsx
 * @module components/ui/tabs
 * Tabs component with spring-animated active indicator and content transitions.
 */

"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Tabs as TabsPrimitive } from "radix-ui"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"
import {
  Highlight,
  HighlightItem,
  type HighlightProps,
} from "@/components/ui/highlight"
import { getStrictContext } from "@/lib/get-strict-context"
import { useControlledState } from "@/hooks/use-controlled-state"

// --- Context ---

type TabsContextType = {
  value: string | undefined
  setValue: (value: string) => void
}

const [TabsProvider, useTabs] =
  getStrictContext<TabsContextType>("TabsContext")

const TabsVariantContext = React.createContext<"default" | "line">("default")
const TabsContentsContext = React.createContext(false)

// --- Root ---

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>): React.ReactNode {
  const [value, setValue] = useControlledState({
    value: props.value,
    defaultValue: props.defaultValue,
    onChange: props.onValueChange,
  })

  return (
    <TabsProvider value={{ value, setValue }}>
      <TabsPrimitive.Root
        data-slot="tabs"
        data-orientation={orientation}
        orientation={orientation}
        className={cn(
          "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col",
          className
        )}
        {...props}
        onValueChange={setValue}
      />
    </TabsProvider>
  )
}

// --- Highlight ---

type TabsHighlightProps = Omit<HighlightProps, "controlledItems" | "value">

function TabsHighlight({
  transition = { type: "spring", stiffness: 200, damping: 25 },
  ...props
}: TabsHighlightProps): React.ReactNode {
  const { value } = useTabs()

  return (
    <Highlight
      data-slot="tabs-highlight"
      controlledItems
      value={value}
      transition={transition}
      click={false}
      {...props}
    />
  )
}

// --- List ---

const tabsListVariants = cva(
  "rounded-lg p-[3px] group-data-[orientation=horizontal]/tabs:h-9 data-[variant=line]:rounded-none group/tabs-list text-muted-foreground inline-flex w-fit items-center justify-center group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>): React.ReactNode {
  const list = (
    <TabsVariantContext.Provider value={variant ?? "default"}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        data-variant={variant}
        className={cn(tabsListVariants({ variant }), className)}
        {...props}
      />
    </TabsVariantContext.Provider>
  )

  if (variant === "default") {
    return (
      <TabsHighlight className="absolute z-0 inset-0 border border-transparent rounded-md bg-background dark:border-input dark:bg-input/30 shadow-sm">
        {list}
      </TabsHighlight>
    )
  }

  return list
}

// --- Trigger ---

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>): React.ReactNode {
  const variant = React.useContext(TabsVariantContext)

  const trigger = (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground/60 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-colors duration-500 ease-in-out group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "data-[state=active]:text-foreground dark:data-[state=active]:text-foreground",
        variant === "line" &&
          "after:bg-foreground after:absolute after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 data-[state=active]:after:opacity-100",
        className
      )}
      {...props}
    />
  )

  if (variant === "default") {
    return (
      <HighlightItem
        data-slot="tabs-highlight-item"
        value={props.value}
        className="flex-1"
      >
        {trigger}
      </HighlightItem>
    )
  }

  return trigger
}

// --- Contents (animated wrapper) ---

function TabsContents({
  className,
  children,
  ...props
}: React.ComponentProps<"div">): React.ReactNode {
  const { value } = useTabs()

  const activeChild = React.Children.toArray(children).find(
    (child): child is React.ReactElement =>
      React.isValidElement(child) &&
      (child.props as Record<string, unknown>).value === value
  )

  return (
    <TabsContentsContext.Provider value={true}>
      <div data-slot="tabs-contents" className={className} {...props}>
        {activeChild
          ? React.cloneElement(activeChild, {
              key: (activeChild.props as Record<string, unknown>)
                .value as string,
            })
          : null}
      </div>
    </TabsContentsContext.Provider>
  )
}

// --- Content ---

function TabsContent({
  className,
  children,
  value,
  forceMount,
  onDrag: _onDrag,
  onDragEnd: _onDragEnd,
  onDragStart: _onDragStart,
  onAnimationStart: _onAnimationStart,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>): React.ReactNode {
  const insideContents = React.useContext(TabsContentsContext)

  if (insideContents) {
    return (
      <TabsPrimitive.Content asChild forceMount value={value}>
        <motion.div
          data-slot="tabs-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className={cn("flex-1 outline-none", className)}
          {...props}
        >
          {children}
        </motion.div>
      </TabsPrimitive.Content>
    )
  }

  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      value={value}
      forceMount={forceMount}
      className={cn("flex-1 outline-none", className)}
      {...props}
    >
      {children}
    </TabsPrimitive.Content>
  )
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsContents,
  tabsListVariants,
}
