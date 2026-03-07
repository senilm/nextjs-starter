/**
 * @file stepper.tsx
 * @module components/ui/stepper
 * Animated step indicator with directional slides and spring-based highlight.
 */

'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'
import { getStrictContext } from '@/lib/get-strict-context'
import { Highlight, HighlightItem } from '@/components/ui/highlight'

// --- Types ---

type StepConfig = {
  label: string
  description?: string
}

type StepperContextType = {
  activeStep: number
  steps: StepConfig[]
  direction: number
  goTo: (step: number) => void
  next: () => void
  back: () => void
  isFirst: boolean
  isLast: boolean
}

// --- Context ---

const [StepperProvider, useStepper] =
  getStrictContext<StepperContextType>('StepperContext')

export { useStepper }

// --- Root ---

type StepperProps = {
  steps: StepConfig[]
  activeStep?: number
  onStepChange?: (step: number) => void
  children: React.ReactNode
}

const Stepper = ({ steps, activeStep: controlledStep, onStepChange, children }: StepperProps): React.ReactNode => {
  const [internalStep, setInternalStep] = React.useState(0)
  const [direction, setDirection] = React.useState(0)

  const activeStep = controlledStep ?? internalStep

  const goTo = React.useCallback(
    (step: number) => {
      if (step < 0 || step >= steps.length) return
      setDirection(step > activeStep ? 1 : -1)
      if (controlledStep !== undefined) {
        onStepChange?.(step)
      } else {
        setInternalStep(step)
        onStepChange?.(step)
      }
    },
    [activeStep, steps.length, controlledStep, onStepChange],
  )

  const next = React.useCallback(() => goTo(activeStep + 1), [goTo, activeStep])
  const back = React.useCallback(() => goTo(activeStep - 1), [goTo, activeStep])

  const ctx = React.useMemo<StepperContextType>(
    () => ({
      activeStep,
      steps,
      direction,
      goTo,
      next,
      back,
      isFirst: activeStep === 0,
      isLast: activeStep === steps.length - 1,
    }),
    [activeStep, steps, direction, goTo, next, back],
  )

  return <StepperProvider value={ctx}>{children}</StepperProvider>
}

// --- Header (step indicators) ---

const StepperHeader = ({ className, ...props }: React.ComponentProps<'nav'>): React.ReactNode => {
  const { activeStep, steps } = useStepper()

  return (
    <nav
      data-slot="stepper-header"
      className={cn('flex items-center', className)}
      aria-label="Progress"
      {...props}
    >
      <Highlight
        mode="parent"
        controlledItems
        value={String(activeStep)}
        click={false}
        exitDelay={0}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="rounded-lg bg-primary/10 dark:bg-primary/15"
        containerClassName="w-full"
      >
        <ol className="flex w-full items-center justify-center">
          {steps.map((step, index) => {
            const isCompleted = index < activeStep
            const isActive = index === activeStep

            return (
              <React.Fragment key={index}>
                <HighlightItem as="li" value={String(index)} className="shrink-0">
                  <div
                    data-slot="stepper-step"
                    className="flex items-center gap-3 rounded-lg px-4 py-3 transition-colors"
                  >
                    <span
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                        isCompleted &&
                          'border-primary bg-primary text-primary-foreground',
                        isActive &&
                          'border-primary text-primary',
                        !isCompleted &&
                          !isActive &&
                          'border-muted-foreground/30 text-muted-foreground/50',
                      )}
                    >
                      {isCompleted ? <Check className="size-4" /> : index + 1}
                    </span>

                    <div className="flex flex-col min-w-0">
                      <span
                        className={cn(
                          'text-sm font-medium truncate transition-colors',
                          isActive && 'text-foreground',
                          isCompleted && 'text-foreground',
                          !isActive && !isCompleted && 'text-muted-foreground',
                        )}
                      >
                        {step.label}
                      </span>
                      {step.description && (
                        <span className="text-xs text-muted-foreground truncate">
                          {step.description}
                        </span>
                      )}
                    </div>
                  </div>
                </HighlightItem>

                {index < steps.length - 1 && (
                  <li role="presentation" aria-hidden="true" className="flex-1 max-w-16 px-1">
                    <div
                      className={cn(
                        'h-0.5 rounded-full transition-colors',
                        isCompleted ? 'bg-primary' : 'bg-border',
                      )}
                    />
                  </li>
                )}
              </React.Fragment>
            )
          })}
        </ol>
      </Highlight>
    </nav>
  )
}

// --- Content (animated step content) ---

const StepperContent = ({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>): React.ReactNode => {
  const { activeStep, direction } = useStepper()

  const steps = React.Children.toArray(children)
  const activeChild = steps[activeStep]

  const variants = {
    enter: (d: number) => ({
      x: d >= 0 ? 80 : -80,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({
      x: d >= 0 ? -80 : 80,
      opacity: 0,
    }),
  }

  return (
    <div
      data-slot="stepper-content"
      className={cn('relative overflow-x-clip', className)}
      {...props}
    >
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={activeStep}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          {activeChild}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// --- Step (individual step wrapper) ---

const Step = ({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>): React.ReactNode => (
  <div data-slot="stepper-step-content" className={className} {...props}>
    {children}
  </div>
)

// --- Footer (navigation buttons) ---

type StepperFooterProps = React.ComponentProps<'div'> & {
  children?: React.ReactNode
}

const StepperFooter = ({
  className,
  children,
  ...props
}: StepperFooterProps): React.ReactNode => (
  <div
    data-slot="stepper-footer"
    className={cn(
      'flex items-center justify-between gap-2',
      className,
    )}
    {...props}
  >
    {children}
  </div>
)

export { Stepper, StepperHeader, StepperContent, Step, StepperFooter }
