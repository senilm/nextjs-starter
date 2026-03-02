/**
 * @file checkbox.tsx
 * @module components/ui/checkbox
 * Checkbox with animated SVG path and spring-based hover/tap interactions.
 */

"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"
import { motion, type SVGMotionProps, type HTMLMotionProps } from "motion/react"

import { cn } from "@/lib/utils"
import { getStrictContext } from "@/lib/get-strict-context"
import { useControlledState } from "@/hooks/use-controlled-state"

// --- Context ---

type CheckboxContextType = {
  isChecked: boolean | "indeterminate"
  setIsChecked: (checked: boolean | "indeterminate") => void
}

const [CheckboxProvider, useCheckbox] =
  getStrictContext<CheckboxContextType>("CheckboxContext")

// --- Indicator (animated SVG) ---

type CheckboxIndicatorProps = SVGMotionProps<SVGSVGElement>

function CheckboxIndicator(props: CheckboxIndicatorProps): React.ReactNode {
  const { isChecked } = useCheckbox()

  return (
    <CheckboxPrimitive.Indicator forceMount asChild>
      <motion.svg
        data-slot="checkbox-indicator"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="3.5"
        stroke="currentColor"
        initial="unchecked"
        animate={isChecked ? "checked" : "unchecked"}
        {...props}
      >
        {isChecked === "indeterminate" ? (
          <motion.line
            x1="5"
            y1="12"
            x2="19"
            y2="12"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: 1,
              opacity: 1,
              transition: { duration: 0.2 },
            }}
          />
        ) : (
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
            variants={{
              checked: {
                pathLength: 1,
                opacity: 1,
                transition: {
                  duration: 0.2,
                  delay: 0.2,
                },
              },
              unchecked: {
                pathLength: 0,
                opacity: 0,
                transition: {
                  duration: 0.2,
                },
              },
            }}
          />
        )}
      </motion.svg>
    </CheckboxPrimitive.Indicator>
  )
}

// --- Checkbox ---

type CheckboxProps = HTMLMotionProps<"button"> &
  Omit<React.ComponentProps<typeof CheckboxPrimitive.Root>, "asChild">

function Checkbox({
  className,
  defaultChecked,
  checked,
  onCheckedChange,
  disabled,
  required,
  name,
  value,
  children,
  ...props
}: CheckboxProps): React.ReactNode {
  const [isChecked, setIsChecked] = useControlledState({
    value: checked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  })

  return (
    <CheckboxProvider value={{ isChecked, setIsChecked }}>
      <CheckboxPrimitive.Root
        defaultChecked={defaultChecked}
        checked={checked}
        onCheckedChange={setIsChecked}
        disabled={disabled}
        required={required}
        name={name}
        value={value}
        asChild
      >
        <motion.button
          data-slot="checkbox"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          className={cn(
            "peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center transition-colors duration-500",
            className
          )}
          {...props}
        >
          {children}
          <CheckboxIndicator className="size-3.5" />
        </motion.button>
      </CheckboxPrimitive.Root>
    </CheckboxProvider>
  )
}

export { Checkbox, type CheckboxProps }
