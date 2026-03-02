/**
 * @file switch.tsx
 * @module components/ui/switch
 * Switch toggle component with spring-animated thumb.
 */

"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"
import { useControlledState } from "@/hooks/use-controlled-state"

function Switch({
  className,
  size = "default",
  checked,
  defaultChecked,
  onCheckedChange,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}): React.ReactNode {
  const [isChecked, setIsChecked] = useControlledState({
    value: checked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  })

  const thumbTravel = size === "sm" ? 10 : 14

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      checked={isChecked}
      onCheckedChange={setIsChecked}
      className={cn(
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-colors outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb asChild>
        <motion.span
          data-slot="switch-thumb"
          animate={{ x: isChecked ? thumbTravel : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block rounded-full ring-0 group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3"
        />
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  )
}

export { Switch }
