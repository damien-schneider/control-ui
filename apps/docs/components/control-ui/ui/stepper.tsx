"use client";

import { CheckIcon, CircleAlertIcon } from "lucide-react";
import type { ComponentProps, CSSProperties } from "react";
import { createContext, useContext, useEffect, useId, useState } from "react";
import type { StepperKnobStyle } from "@/components/control-ui/knob-contracts/stepper-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type StepperOrientation = "horizontal" | "vertical";

export type StepperContentMode = "current" | "all";

export type StepperState = "neutral" | "complete" | "current" | "upcoming";

export type StepperStatusDetails = {
  step: number;
  state: StepperState;
  invalid: boolean;
  disabled: boolean;
};

export type StepperProps = Omit<ComponentProps<"div">, "defaultValue" | "onChange"> & {
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number) => void;
  orientation?: StepperOrientation;
  contentMode?: StepperContentMode;
  responsive?: boolean;
  getStatusLabel?: (details: StepperStatusDetails) => string;
} & { style?: CSSProperties & StepperKnobStyle };

export type StepperListProps = ComponentProps<"ol"> & { style?: CSSProperties & StepperKnobStyle };

export type StepperItemProps = Omit<ComponentProps<"li">, "value"> & {
  step: number;
  disabled?: boolean;
  invalid?: boolean;
} & { style?: CSSProperties & StepperKnobStyle };

export type StepperTriggerProps = Omit<ComponentProps<"button">, "style"> & { style?: CSSProperties & StepperKnobStyle };

export type StepperIndicatorProps = Omit<ComponentProps<"span">, "style"> & { style?: CSSProperties & StepperKnobStyle };

export type StepperSeparatorProps = Omit<ComponentProps<"span">, "style"> & { style?: CSSProperties & StepperKnobStyle };

export type StepperTitleProps = Omit<ComponentProps<"span">, "style"> & { style?: CSSProperties & StepperKnobStyle };

export type StepperDescriptionProps = Omit<ComponentProps<"span">, "style"> & { style?: CSSProperties & StepperKnobStyle };

export type StepperContentProps = ComponentProps<"section"> & {
  step: number;
  keepMounted?: boolean;
} & { style?: CSSProperties & StepperKnobStyle };

type RegisterId = (id: string) => () => void;

type StepperContextValue = {
  value: number | null;
  orientation: StepperOrientation;
  contentMode: StepperContentMode;
  responsive: boolean;
  baseId: string;
  selectStep: (step: number) => void;
  getStatusLabel: (details: StepperStatusDetails) => string;
  renderedIds: ReadonlySet<string>;
  registerId: RegisterId;
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
  descriptionId: string;
  statusId: string;
  contentId: string;
};

const StepperItemContext = createContext<StepperItemContextValue | null>(null);

function useStepperItem() {
  const context = useContext(StepperItemContext);
  if (!context) throw new Error("Stepper item parts must be used within <StepperItem>.");
  return context;
}

function stepPartId(baseId: string, step: number, part: "title" | "description" | "status" | "content") {
  return `${baseId}-step-${step}-${part}`;
}

function useRegisteredId(id: string, rendered = true) {
  const { registerId } = useStepper();
  useEffect(() => (rendered ? registerId(id) : undefined), [id, rendered, registerId]);
}

function renderedIdRefs(renderedIds: ReadonlySet<string>, ids: string[]): string | undefined {
  const refs = ids.filter((id) => renderedIds.has(id));
  return refs.length > 0 ? refs.join(" ") : undefined;
}

function stateForStep(value: number | null, step: number): StepperState {
  if (value === null) return "neutral";
  if (step < value) return "complete";
  if (step === value) return "current";
  return "upcoming";
}

function statusStateLabel(state: StepperState, invalid: boolean): string | null {
  if (invalid) return "invalid";
  if (state === "neutral") return null;
  return state;
}

function defaultStatusLabel({ step, state, invalid, disabled }: StepperStatusDetails): string {
  const stateLabel = statusStateLabel(state, invalid);
  return [`Step ${step + 1}`, stateLabel, disabled ? "disabled" : null].filter(Boolean).join(", ");
}

function defaultIndicatorContent(step: number, state: StepperState, invalid: boolean) {
  if (invalid) return <CircleAlertIcon className="size-4" />;
  if (state === "complete") return <CheckIcon className="size-4" />;
  return step + 1;
}

function itemLayout(orientation: StepperOrientation, responsive: boolean) {
  if (orientation === "vertical") {
    return "grid min-w-0 grid-cols-[var(--cui-stepper-indicator-size)_minmax(0,1fr)]";
  }
  return cn(
    "relative grid min-w-0 flex-1 grid-cols-1 justify-items-center",
    responsive &&
      "@max-md/stepper:w-full @max-md/stepper:flex-none @max-md/stepper:grid-cols-[var(--cui-stepper-indicator-size)_minmax(0,1fr)] @max-md/stepper:justify-items-stretch",
  );
}

function partLayout(orientation: StepperOrientation, responsive: boolean, part: "indicator" | "title" | "description") {
  const vertical = {
    indicator: "col-start-1 row-span-2 row-start-1",
    title: "col-start-2 row-start-1",
    description: "col-start-2 row-start-2",
  }[part];
  if (orientation === "vertical") return vertical;

  const horizontal = {
    indicator: "col-start-1 row-start-1",
    title: "col-start-1 row-start-2",
    description: "col-start-1 row-start-3",
  }[part];
  if (!responsive) return horizontal;

  const narrow = {
    indicator: "@max-md/stepper:col-start-1 @max-md/stepper:row-span-2 @max-md/stepper:row-start-1",
    title: "@max-md/stepper:col-start-2 @max-md/stepper:row-start-1",
    description: "@max-md/stepper:col-start-2 @max-md/stepper:row-start-2",
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
  getStatusLabel = defaultStatusLabel,
  id,
  className,
  children,
  ...props
}: StepperProps) {
  const generatedId = useId();
  const [internalValue, setInternalValue] = useState<number | null>(defaultValue);
  const [renderedIds, setRenderedIds] = useState<ReadonlySet<string>>(() => new Set());
  const [registerId] = useState<RegisterId>(() => (renderedId: string) => {
    setRenderedIds((current) => (current.has(renderedId) ? current : new Set(current).add(renderedId)));
    return () =>
      setRenderedIds((current) => {
        if (!current.has(renderedId)) return current;
        const next = new Set(current);
        next.delete(renderedId);
        return next;
      });
  });
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
        getStatusLabel,
        renderedIds,
        registerId,
      }}
    >
      <div
        {...props}
        id={id}
        data-control-ui="stepper"
        data-control-family="stepper"
        data-slot="root"
        data-orientation={orientation}
        data-content-mode={contentMode}
        data-responsive={responsive ? "true" : undefined}
        className={cn(responsive && "@container/stepper", "w-full", className)}
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
      data-control-family="stepper"
      data-slot="list"
      data-orientation={orientation}
      className={cn(
        orientation === "horizontal" ? "flex w-full items-start" : "flex w-full flex-col",
        orientation === "horizontal" && responsive && "@max-md/stepper:flex-col @max-md/stepper:items-stretch",
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
    titleId: stepPartId(baseId, step, "title"),
    descriptionId: stepPartId(baseId, step, "description"),
    statusId: stepPartId(baseId, step, "status"),
    contentId: stepPartId(baseId, step, "content"),
  } satisfies StepperItemContextValue;

  return (
    <StepperItemContext.Provider value={contextValue}>
      <li
        {...props}
        data-control-ui="stepper"
        data-control-family="stepper"
        data-slot="item"
        data-step={step}
        data-state={state}
        data-disabled={disabled ? "true" : undefined}
        data-invalid={invalid ? "true" : undefined}
        aria-current={state === "current" ? "step" : undefined}
        className={cn("relative", itemLayout(orientation, responsive), className)}
      >
        {children}
      </li>
    </StepperItemContext.Provider>
  );
}

export function StepperTrigger({ disabled: disabledProp, className, onClick, type = "button", ...props }: StepperTriggerProps) {
  const { orientation, responsive, selectStep, renderedIds } = useStepper();
  const { step, state, disabled, invalid, titleId, descriptionId, statusId, contentId } = useStepperItem();
  const isDisabled = disabled || Boolean(disabledProp);

  return (
    <button
      {...props}
      data-control-ui="stepper"
      data-control-family="stepper"
      data-slot="trigger"
      data-state={state}
      data-invalid={invalid ? "true" : undefined}
      type={type}
      disabled={isDisabled}
      aria-current={state === "current" ? "step" : undefined}
      aria-labelledby={renderedIdRefs(renderedIds, [titleId])}
      aria-describedby={renderedIdRefs(renderedIds, [statusId, descriptionId])}
      aria-controls={renderedIdRefs(renderedIds, [contentId])}
      className={cn(
        "group/stepper-trigger col-span-full row-span-3 row-start-1 grid w-full min-w-0 grid-cols-1 justify-items-center disabled:pointer-events-none disabled:cursor-not-allowed",
        orientation === "vertical" && "row-span-2 grid-cols-[var(--cui-stepper-indicator-size)_minmax(0,1fr)] justify-items-stretch",
        orientation === "horizontal" &&
          responsive &&
          "@max-md/stepper:row-span-2 @max-md/stepper:grid-cols-[var(--cui-stepper-indicator-size)_minmax(0,1fr)] @max-md/stepper:justify-items-stretch",
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
  const { orientation, responsive, getStatusLabel } = useStepper();
  const { step, state, disabled, invalid, statusId } = useStepperItem();
  useRegisteredId(statusId);
  const indicatorContent = children ?? defaultIndicatorContent(step, state, invalid);

  return (
    <span
      {...props}
      data-control-ui="stepper"
      data-control-family="stepper"
      data-slot="indicator"
      data-state={state}
      data-invalid={invalid ? "true" : undefined}
      className={cn("relative z-10 flex shrink-0 items-center justify-center", partLayout(orientation, responsive, "indicator"), className)}
    >
      <span aria-hidden="true">{indicatorContent}</span>
      <span id={statusId} className="sr-only">
        {getStatusLabel({ step, state, invalid, disabled })}
      </span>
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
      data-control-family="stepper"
      data-slot="separator"
      data-state={state}
      data-invalid={invalid ? "true" : undefined}
      aria-hidden="true"
      className={cn(
        "absolute",
        orientation === "horizontal" &&
          "top-[calc(var(--cui-stepper-indicator-size)/2)] start-[calc(50%_+_var(--cui-stepper-indicator-size)/2)] end-[calc(var(--cui-stepper-indicator-size)/2_-_50%)]",
        orientation === "vertical" && "top-(--cui-stepper-indicator-size) bottom-0 start-[calc(var(--cui-stepper-indicator-size)/2)]",
        orientation === "horizontal" &&
          responsive &&
          "@max-md/stepper:top-(--cui-stepper-indicator-size) @max-md/stepper:end-auto @max-md/stepper:bottom-0 @max-md/stepper:start-[calc(var(--cui-stepper-indicator-size)/2)]",
        className,
      )}
    />
  );
}

export function StepperTitle({ className, ...props }: StepperTitleProps) {
  const { orientation, responsive } = useStepper();
  const { titleId } = useStepperItem();
  useRegisteredId(titleId);
  return (
    <span
      {...props}
      id={titleId}
      data-control-ui="stepper"
      data-control-family="stepper"
      data-slot="title"
      className={cn("min-w-0", partLayout(orientation, responsive, "title"), className)}
    />
  );
}

export function StepperDescription({ className, ...props }: StepperDescriptionProps) {
  const { orientation, responsive } = useStepper();
  const { descriptionId } = useStepperItem();
  useRegisteredId(descriptionId);
  return (
    <span
      {...props}
      id={descriptionId}
      data-control-ui="stepper"
      data-control-family="stepper"
      data-slot="description"
      className={cn("min-w-0", partLayout(orientation, responsive, "description"), className)}
    />
  );
}

export function StepperContent({ step, keepMounted = true, className, ...props }: StepperContentProps) {
  const { value, contentMode, baseId } = useStepper();
  const active = value === step;
  const hidden = contentMode === "current" && !active;
  const rendered = !hidden || keepMounted;
  const contentId = stepPartId(baseId, step, "content");
  useRegisteredId(contentId, rendered);
  if (!rendered) return null;

  return (
    <section
      {...props}
      id={contentId}
      data-control-ui="stepper"
      data-control-family="stepper"
      data-slot="content"
      data-state={active ? "active" : "inactive"}
      hidden={hidden}
      aria-labelledby={stepPartId(baseId, step, "title")}
      className={className}
    />
  );
}
