"use client";

import { CheckIcon, CircleAlertIcon } from "lucide-react";
import { createContext, useContext, useId, useState } from "react";
import type {
  StepperContentMode,
  StepperContentProps,
  StepperDescriptionProps,
  StepperIndicatorProps,
  StepperItemProps,
  StepperListProps,
  StepperOrientation,
  StepperProps,
  StepperSeparatorProps,
  StepperState,
  StepperTitleProps,
  StepperTriggerProps,
} from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

type StepperContextValue = {
  value: number | null;
  orientation: StepperOrientation;
  contentMode: StepperContentMode;
  responsive: boolean;
  baseId: string;
  selectStep: (step: number) => void;
};

const StepperContext = createContext<StepperContextValue | null>(null);

function useStepper() {
  const context = useContext(StepperContext);
  if (!context) throw new Error("Stepper parts must be used within <Stepper>.");
  return context;
}

type StepperItemContextValue = {
  step: number;
  state: StepperState;
  disabled: boolean;
  invalid: boolean;
  titleId: string;
  contentId: string;
};

const StepperItemContext = createContext<StepperItemContextValue | null>(null);

function useStepperItem() {
  const context = useContext(StepperItemContext);
  if (!context) throw new Error("Stepper item parts must be used within <StepperItem>.");
  return context;
}

function stateForStep(value: number | null, step: number): StepperState {
  if (value === null) return "neutral";
  if (step < value) return "complete";
  if (step === value) return "current";
  return "upcoming";
}

function indicatorStateLabel(state: StepperState, invalid: boolean): string | null {
  if (invalid) return "invalid";
  if (state === "neutral") return null;
  return state;
}

function defaultIndicatorContent(step: number, state: StepperState, invalid: boolean) {
  if (invalid) return <CircleAlertIcon className="size-4" />;
  if (state === "complete") return <CheckIcon className="size-4" />;
  return step + 1;
}

function itemLayout(orientation: StepperOrientation, responsive: boolean) {
  if (orientation === "vertical") {
    return "grid min-w-0 grid-cols-[2rem_minmax(0,1fr)] pb-6 text-left last:pb-0";
  }
  return cn(
    "relative grid min-w-0 flex-1 grid-cols-1 justify-items-center text-center",
    responsive &&
      "@max-md/stepper:w-full @max-md/stepper:flex-none @max-md/stepper:grid-cols-[2rem_minmax(0,1fr)] @max-md/stepper:justify-items-stretch @max-md/stepper:pb-6 @max-md/stepper:text-left @max-md/stepper:last:pb-0",
  );
}

function partLayout(orientation: StepperOrientation, responsive: boolean, part: "indicator" | "title" | "description") {
  const vertical = {
    indicator: "col-start-1 row-span-2 row-start-1",
    title: "col-start-2 row-start-1 ml-3",
    description: "col-start-2 row-start-2 ml-3",
  }[part];
  if (orientation === "vertical") return vertical;

  const horizontal = {
    indicator: "col-start-1 row-start-1",
    title: "col-start-1 row-start-2 mt-2",
    description: "col-start-1 row-start-3 mt-0.5",
  }[part];
  if (!responsive) return horizontal;

  const narrow = {
    indicator: "@max-md/stepper:col-start-1 @max-md/stepper:row-span-2 @max-md/stepper:row-start-1",
    title: "@max-md/stepper:col-start-2 @max-md/stepper:row-start-1 @max-md/stepper:mt-0 @max-md/stepper:ml-3",
    description: "@max-md/stepper:col-start-2 @max-md/stepper:row-start-2 @max-md/stepper:mt-0 @max-md/stepper:ml-3",
  }[part];
  return cn(horizontal, narrow);
}

export function Stepper({
  value,
  defaultValue = null,
  onValueChange,
  orientation = "horizontal",
  contentMode = "current",
  responsive = true,
  id,
  className,
  children,
  ...props
}: StepperProps) {
  const generatedId = useId();
  const [internalValue, setInternalValue] = useState<number | null>(defaultValue);
  const controlled = value !== undefined;
  const currentValue = value !== undefined ? value : internalValue;

  const selectStep = (step: number) => {
    if (!controlled) setInternalValue(step);
    onValueChange?.(step);
  };

  return (
    <StepperContext.Provider
      value={{
        value: currentValue,
        orientation,
        contentMode,
        responsive,
        baseId: id ?? generatedId,
        selectStep,
      }}
    >
      <div
        {...props}
        id={id}
        data-control-ui="stepper"
        data-slot="root"
        data-orientation={orientation}
        data-content-mode={contentMode}
        data-responsive={responsive ? "true" : undefined}
        className={cn(
          responsive && "@container/stepper",
          "w-full",
          skinSlot("stepper", "root", { orientation, contentMode, responsive }),
          className,
        )}
      >
        {children}
      </div>
    </StepperContext.Provider>
  );
}

export function StepperList({ className, ...props }: StepperListProps) {
  const { orientation, responsive } = useStepper();
  return (
    <ol
      {...props}
      data-control-ui="stepper"
      data-slot="list"
      data-orientation={orientation}
      className={cn(
        orientation === "horizontal" ? "flex w-full items-start" : "flex w-full flex-col",
        orientation === "horizontal" && responsive && "@max-md/stepper:flex-col @max-md/stepper:items-stretch",
        skinSlot("stepper", "list", { orientation, responsive }),
        className,
      )}
    />
  );
}

export function StepperItem({ step, disabled = false, invalid = false, className, children, ...props }: StepperItemProps) {
  const { value, orientation, responsive, baseId } = useStepper();
  const state = stateForStep(value, step);
  const contextValue = {
    step,
    state,
    disabled,
    invalid,
    titleId: `${baseId}-step-${step}-title`,
    contentId: `${baseId}-step-${step}-content`,
  } satisfies StepperItemContextValue;

  return (
    <StepperItemContext.Provider value={contextValue}>
      <li
        {...props}
        data-control-ui="stepper"
        data-slot="item"
        data-step={step}
        data-state={state}
        data-disabled={disabled ? "true" : undefined}
        data-invalid={invalid ? "true" : undefined}
        aria-current={state === "current" ? "step" : undefined}
        className={cn(
          "relative",
          itemLayout(orientation, responsive),
          skinSlot("stepper", "item", { state, disabled, invalid }),
          className,
        )}
      >
        {children}
      </li>
    </StepperItemContext.Provider>
  );
}

export function StepperTrigger({ disabled: disabledProp, className, onClick, type = "button", ...props }: StepperTriggerProps) {
  const { orientation, responsive, selectStep } = useStepper();
  const { step, state, disabled, invalid, contentId } = useStepperItem();
  const isDisabled = disabled || Boolean(disabledProp);

  return (
    <button
      {...props}
      data-control-ui="stepper"
      data-slot="trigger"
      data-state={state}
      data-invalid={invalid ? "true" : undefined}
      type={type}
      disabled={isDisabled}
      aria-controls={contentId}
      className={cn(
        "group/stepper-trigger col-span-full row-span-3 row-start-1 grid w-full min-w-0 grid-cols-1 justify-items-center rounded-sm text-center outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        orientation === "vertical" && "row-span-2 grid-cols-[2rem_minmax(0,1fr)] justify-items-stretch text-left",
        orientation === "horizontal" &&
          responsive &&
          "@max-md/stepper:row-span-2 @max-md/stepper:grid-cols-[2rem_minmax(0,1fr)] @max-md/stepper:justify-items-stretch @max-md/stepper:text-left",
        skinSlot("stepper", "trigger", { state, disabled: isDisabled, invalid }),
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented && !isDisabled) selectStep(step);
      }}
    />
  );
}

export function StepperIndicator({ className, children, ...props }: StepperIndicatorProps) {
  const { orientation, responsive } = useStepper();
  const { step, state, disabled, invalid } = useStepperItem();
  const stateLabel = indicatorStateLabel(state, invalid);
  const status = [`Step ${step + 1}`, stateLabel, disabled ? "disabled" : null].filter(Boolean).join(", ");
  const indicatorContent = children ?? defaultIndicatorContent(step, state, invalid);

  return (
    <span
      {...props}
      data-control-ui="stepper"
      data-slot="indicator"
      data-state={state}
      data-invalid={invalid ? "true" : undefined}
      className={cn(
        "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border bg-background text-xs font-semibold tabular-nums text-muted-foreground transition-[color,background-color,border-color,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-standard)]",
        state === "complete" && !invalid && "border-primary bg-primary text-primary-foreground",
        state === "current" && !invalid && "border-primary text-primary-text ring-4 ring-primary/10",
        invalid && "border-dashed border-destructive bg-destructive/10 text-destructive-text",
        partLayout(orientation, responsive, "indicator"),
        skinSlot("stepper", "indicator", { state, invalid }),
        className,
      )}
    >
      <span aria-hidden="true">{indicatorContent}</span>
      <span className="sr-only">{status}</span>
    </span>
  );
}

export function StepperSeparator({ className, ...props }: StepperSeparatorProps) {
  const { orientation, responsive } = useStepper();
  const { state, invalid } = useStepperItem();
  return (
    <span
      {...props}
      data-control-ui="stepper"
      data-slot="separator"
      data-state={state}
      aria-hidden="true"
      className={cn(
        "absolute bg-border transition-colors duration-[var(--duration-base)] ease-[var(--ease-standard)]",
        state === "complete" && !invalid && "bg-primary",
        orientation === "horizontal" && "top-4 right-[calc(-50%+1rem)] left-[calc(50%+1rem)] h-px",
        orientation === "vertical" && "top-8 bottom-0 left-4 w-px",
        orientation === "horizontal" &&
          responsive &&
          "@max-md/stepper:top-8 @max-md/stepper:right-auto @max-md/stepper:bottom-0 @max-md/stepper:left-4 @max-md/stepper:h-auto @max-md/stepper:w-px",
        skinSlot("stepper", "separator", { state, invalid }),
        className,
      )}
    />
  );
}

export function StepperTitle({ className, ...props }: StepperTitleProps) {
  const { orientation, responsive } = useStepper();
  const { titleId } = useStepperItem();
  return (
    <span
      {...props}
      id={titleId}
      data-control-ui="stepper"
      data-slot="title"
      className={cn(
        "min-w-0 text-sm font-medium leading-tight text-foreground",
        partLayout(orientation, responsive, "title"),
        skinSlot("stepper", "title", {}),
        className,
      )}
    />
  );
}

export function StepperDescription({ className, ...props }: StepperDescriptionProps) {
  const { orientation, responsive } = useStepper();
  return (
    <span
      {...props}
      data-control-ui="stepper"
      data-slot="description"
      className={cn(
        "min-w-0 text-sm leading-relaxed text-muted-foreground",
        partLayout(orientation, responsive, "description"),
        skinSlot("stepper", "description", {}),
        className,
      )}
    />
  );
}

export function StepperContent({ step, keepMounted = true, className, ...props }: StepperContentProps) {
  const { value, contentMode, baseId } = useStepper();
  const active = value === step;
  const hidden = contentMode === "current" && !active;
  if (hidden && !keepMounted) return null;

  return (
    <section
      {...props}
      id={`${baseId}-step-${step}-content`}
      data-control-ui="stepper"
      data-slot="content"
      data-state={active ? "active" : "inactive"}
      hidden={hidden}
      aria-labelledby={`${baseId}-step-${step}-title`}
      className={cn("mt-6 outline-none", skinSlot("stepper", "content", { active }), className)}
    />
  );
}
