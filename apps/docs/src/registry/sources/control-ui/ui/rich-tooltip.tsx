"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

import type { PopupKnobStyle } from "@/components/control-ui/knob-contracts/popup-knobs";
import type { RichTooltipKnobStyle } from "@/components/control-ui/knob-contracts/rich-tooltip-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { skinEffects, skinId } from "@/components/control-ui/skin";
import { stepAfter, stepBefore, type TourPosition, tourPosition } from "./rich-tooltip-tour";

export type RichTooltipTone = "accent" | "surface";

export type RichTooltipProgressVariant = "count" | "dots";

type RichTooltipContentKnobStyle = RichTooltipKnobStyle & PopupKnobStyle;

type TourValue = TourPosition & {
  activeStep: string | null;
  next: () => void;
  previous: () => void;
  goTo: (step: string) => void;
  finish: () => void;
};

const TourContext = createContext<TourValue | null>(null);

/** Null outside `<RichTooltipTour>` — single-use rich tooltips read it and skip their step affordances. */
export function useTour() {
  return useContext(TourContext);
}

// Blocked storage (private mode, disabled cookies) must not take the surface down with it.
function readSeen(storageKey: string | undefined) {
  if (!storageKey) return false;
  try {
    return globalThis.localStorage?.getItem(storageKey) === "seen";
  } catch {
    return false;
  }
}

function writeSeen(storageKey: string | undefined) {
  if (!storageKey) return;
  try {
    globalThis.localStorage?.setItem(storageKey, "seen");
  } catch {
    // no persistence available — surface still dismisses for this session
  }
}

/** Starts closed so the server and first client pass agree, then opens once storage has been read. */
function useSeenGate(storageKey: string | undefined, enabled: boolean) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    setAllowed(!readSeen(storageKey));
  }, [enabled, storageKey]);

  return allowed;
}

export type RichTooltipTourProps = {
  steps: readonly string[];
  step?: string | null;
  defaultStep?: string;
  onStepChange?: (step: string | null) => void;
  onComplete?: () => void;
  storageKey?: string;
  children?: ReactNode;
};

export function RichTooltipTour({ steps, step, defaultStep, onStepChange, onComplete, storageKey, children }: RichTooltipTourProps) {
  const [uncontrolledStep, setUncontrolledStep] = useState<string | null>(defaultStep ?? steps[0] ?? null);
  const started = useSeenGate(storageKey, step === undefined);
  const uncontrolledActiveStep = started ? uncontrolledStep : null;
  const activeStep = step === undefined ? uncontrolledActiveStep : step;

  function setStep(next: string | null) {
    if (step === undefined) setUncontrolledStep(next);
    onStepChange?.(next);
    if (next === null) {
      writeSeen(storageKey);
      onComplete?.();
    }
  }

  const position = tourPosition(steps, activeStep);
  const value: TourValue = {
    activeStep,
    ...position,
    next: () => setStep(stepAfter(steps, position.index)),
    previous: () => setStep(stepBefore(steps, position.index)),
    goTo: (target) => setStep(target),
    finish: () => setStep(null),
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

type RichTooltipContextValue = {
  tone: RichTooltipTone;
  dismiss: () => void;
};

const RichTooltipContext = createContext<RichTooltipContextValue | null>(null);

function useRichTooltipContext() {
  const context = useContext(RichTooltipContext);
  if (!context) throw new Error("RichTooltip parts must be rendered inside <RichTooltip>.");
  return context;
}

export type RichTooltipProps = Omit<ComponentProps<typeof PopoverPrimitive.Root>, "modal"> & {
  step?: string;
  tone?: RichTooltipTone;
  storageKey?: string;
  dismissOnOutsidePress?: boolean;
  trapFocus?: boolean;
};

export function RichTooltip({
  step,
  tone = "accent",
  storageKey,
  dismissOnOutsidePress = false,
  trapFocus = false,
  open,
  defaultOpen = true,
  onOpenChange,
  children,
  ...props
}: RichTooltipProps) {
  const tour = useTour();
  const inTour = tour !== null && step !== undefined;
  const [standaloneOpen, setStandaloneOpen] = useState(defaultOpen);
  const standaloneAllowed = useSeenGate(storageKey, open === undefined && !inTour);

  const resolvedOpen = open ?? (inTour ? tour.activeStep === step : standaloneOpen && standaloneAllowed);

  function dismiss() {
    if (inTour) {
      tour.finish();
      return;
    }
    setStandaloneOpen(false);
    writeSeen(storageKey);
  }

  const handleOpenChange: NonNullable<RichTooltipProps["onOpenChange"]> = (nextOpen, details) => {
    if (!dismissOnOutsidePress && details.reason === "outside-press") return;
    onOpenChange?.(nextOpen, details);
    if (!nextOpen) dismiss();
  };

  const context: RichTooltipContextValue = { tone, dismiss };

  return (
    <RichTooltipContext.Provider value={context}>
      <PopoverPrimitive.Root open={resolvedOpen} onOpenChange={handleOpenChange} modal={trapFocus ? "trap-focus" : false} {...props}>
        {children}
      </PopoverPrimitive.Root>
    </RichTooltipContext.Provider>
  );
}

export function RichTooltipTrigger({
  className,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Trigger> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <PopoverPrimitive.Trigger
      data-control-ui="rich-tooltip"
      data-control-family="popup"
      data-popup-kind="rich-tooltip"
      data-slot="trigger"
      className={className}
      {...props}
    />
  );
}

type AnchorProp = ComponentProps<typeof PopoverPrimitive.Positioner>["anchor"];

function resolveAnchorElement(anchor: AnchorProp): Element | null {
  const candidate = typeof anchor === "function" ? anchor() : anchor;
  if (!candidate) return null;
  if (candidate instanceof Element) return candidate;
  if ("current" in candidate) return candidate.current;
  return null;
}

function useAnchorScroll(anchor: AnchorProp, open: boolean, enabled: boolean) {
  useEffect(() => {
    if (!(open && enabled)) return;
    const element = resolveAnchorElement(anchor);
    if (!element) return;
    const reduced = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    element.scrollIntoView({ block: "center", inline: "nearest", behavior: reduced ? "auto" : "smooth" });
  }, [anchor, enabled, open]);
}

export type RichTooltipContentProps = Omit<ComponentProps<typeof PopoverPrimitive.Popup>, "style"> & {
  style?: CSSProperties & RichTooltipContentKnobStyle;
} & {
  side?: ComponentProps<typeof PopoverPrimitive.Positioner>["side"];
  align?: ComponentProps<typeof PopoverPrimitive.Positioner>["align"];
  sideOffset?: number;
  anchor?: AnchorProp;
  collisionPadding?: ComponentProps<typeof PopoverPrimitive.Positioner>["collisionPadding"];
  arrow?: boolean;
  scrollAnchorIntoView?: boolean;
};

export function RichTooltipContent({
  className,
  children,
  side = "bottom",
  align = "center",
  sideOffset = 10,
  anchor,
  collisionPadding = 12,
  arrow = true,
  scrollAnchorIntoView = true,
  ...props
}: RichTooltipContentProps) {
  const { tone } = useRichTooltipContext();
  const isSurface = tone === "surface";
  useAnchorScroll(anchor, true, scrollAnchorIntoView);

  return (
    <PopoverPrimitive.Portal>
      {/* portal escapes every token-scoped ancestor, so scope is re-asserted here */}
      <PopoverPrimitive.Positioner
        data-control-ui="rich-tooltip"
        data-popup-kind="rich-tooltip"
        data-control-family="popup"
        data-slot="positioner"
        data-skin={skinId()}
        data-effects={skinEffects()}
        side={side}
        align={align}
        sideOffset={sideOffset}
        anchor={anchor}
        collisionPadding={collisionPadding}
        className="z-[80]"
      >
        <PopoverPrimitive.Popup
          data-control-ui="rich-tooltip"
          data-popup-kind="rich-tooltip"
          data-control-family="popup"
          data-slot="content"
          data-tone={tone}
          data-surface={isSurface ? "floating" : undefined}
          data-popup-part={isSurface ? "surface" : undefined}
          className={cn("relative grid w-80 max-w-[calc(100vw-2rem)]", className)}
          {...props}
        >
          {children}
          {arrow ? (
            <PopoverPrimitive.Arrow
              data-control-ui="rich-tooltip"
              data-popup-kind="rich-tooltip"
              data-control-family="popup"
              data-slot="arrow"
              data-tone={tone}
              className={cn(
                "flex",
                "data-[side=top]:-bottom-[8px]",
                "data-[side=bottom]:-top-[8px]",
                "data-[side=left]:-right-[10px]",
                "data-[side=right]:-left-[10px]",
              )}
            >
              <RichTooltipArrowSvg />
            </PopoverPrimitive.Arrow>
          ) : null}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

function RichTooltipArrowSvg() {
  return (
    <svg aria-hidden="true" focusable="false" width="12" height="8" viewBox="0 0 12 8" fill="none" overflow="visible">
      <path d="M0 7L4 2Q6 0 8 2L12 7L12 8L0 8Z" />
    </svg>
  );
}

// Cancels the content padding, so it only reads correctly as the first child. Inherited corners follow a skinned radius.
export function RichTooltipMedia({ className, ...props }: ComponentProps<"div"> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <div
      data-control-ui="rich-tooltip"
      data-control-family="popup"
      data-popup-kind="rich-tooltip"
      data-slot="media"
      className={cn("overflow-hidden [&_img]:w-full [&_img]:object-cover [&_video]:w-full", className)}
      {...props}
    />
  );
}

export function RichTooltipHeader({ className, ...props }: ComponentProps<"div"> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <div
      data-control-ui="rich-tooltip"
      data-control-family="popup"
      data-popup-kind="rich-tooltip"
      data-slot="header"
      className={cn("flex items-start justify-between", className)}
      {...props}
    />
  );
}

export function RichTooltipTitle({
  className,
  ...props
}: Omit<ComponentProps<typeof PopoverPrimitive.Title>, "style"> & {
  style?: CSSProperties & RichTooltipKnobStyle & PopupKnobStyle;
}) {
  return (
    <PopoverPrimitive.Title
      data-control-ui="rich-tooltip"
      data-control-family="popup"
      data-popup-kind="rich-tooltip"
      data-slot="title"
      className={className}
      {...props}
    />
  );
}

export function RichTooltipDescription({
  className,
  ...props
}: Omit<ComponentProps<typeof PopoverPrimitive.Description>, "style"> & {
  style?: CSSProperties & RichTooltipKnobStyle & PopupKnobStyle;
}) {
  const { tone } = useRichTooltipContext();
  return (
    <PopoverPrimitive.Description
      data-control-ui="rich-tooltip"
      data-control-family="popup"
      data-popup-kind="rich-tooltip"
      data-slot="description"
      data-tone={tone}
      className={className}
      {...props}
    />
  );
}

export function RichTooltipFooter({ className, ...props }: ComponentProps<"div"> & { style?: CSSProperties & PopupKnobStyle }) {
  return (
    <div
      data-control-ui="rich-tooltip"
      data-control-family="popup"
      data-popup-kind="rich-tooltip"
      data-slot="footer"
      className={cn("flex items-center justify-between", className)}
      {...props}
    />
  );
}

export type RichTooltipProgressProps = Omit<ComponentProps<"div">, "style"> & {
  variant?: RichTooltipProgressVariant;
  style?: CSSProperties & RichTooltipKnobStyle & PopupKnobStyle;
};

export function RichTooltipProgress({ className, variant = "count", children, ...props }: RichTooltipProgressProps) {
  const { tone } = useRichTooltipContext();
  const tour = useTour();
  if (!tour || tour.total < 2 || tour.index < 0) return null;

  return (
    <div
      data-control-ui="rich-tooltip"
      data-control-family="popup"
      data-popup-kind="rich-tooltip"
      data-slot="progress"
      data-variant={variant}
      data-tone={tone}
      className={cn("flex items-center", className)}
      {...props}
    >
      <span className="sr-only">{`Step ${tour.index + 1} of ${tour.total}`}</span>
      {children ??
        (variant === "dots" ? (
          Array.from({ length: tour.total }, (_, dot) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: dots are positional, they carry no other identity
              key={dot}
              data-control-ui="rich-tooltip"
              data-control-family="popup"
              data-popup-kind="rich-tooltip"
              data-slot="dot"
              data-active={dot === tour.index ? "true" : undefined}
              className=""
            />
          ))
        ) : (
          <span aria-hidden="true">{`${tour.index + 1}/${tour.total}`}</span>
        ))}
    </div>
  );
}

const actionClasses = "inline-flex shrink-0 cursor-pointer items-center justify-center disabled:pointer-events-none [&_svg]:size-4";

export function RichTooltipPrevious({
  className,
  children,
  onClick,
  ...props
}: Omit<ComponentProps<"button">, "style"> & {
  style?: CSSProperties & RichTooltipKnobStyle & PopupKnobStyle;
}) {
  const tour = useTour();
  if (!tour || tour.total < 2) return null;

  return (
    <button
      type="button"
      data-control-ui="rich-tooltip"
      data-control-family="popup"
      data-popup-kind="rich-tooltip"
      data-slot="previous"
      disabled={tour.isFirst}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) tour.previous();
      }}
      className={cn(actionClasses, className)}
      {...props}
    >
      {children ?? (
        <>
          <ChevronLeftIcon aria-hidden="true" />
          <span className="sr-only">Previous step</span>
        </>
      )}
    </button>
  );
}

export function RichTooltipNext({
  className,
  children,
  onClick,
  ...props
}: Omit<ComponentProps<"button">, "style"> & {
  style?: CSSProperties & RichTooltipKnobStyle & PopupKnobStyle;
}) {
  const { dismiss } = useRichTooltipContext();
  const tour = useTour();

  return (
    <button
      type="button"
      data-control-ui="rich-tooltip"
      data-control-family="popup"
      data-popup-kind="rich-tooltip"
      data-slot="next"
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (tour) tour.next();
        else dismiss();
      }}
      className={cn(actionClasses, className)}
      {...props}
    >
      {children ??
        (tour ? (
          <>
            <span className="sr-only">{tour.isLast ? "Finish" : "Next step"}</span>
            <ChevronRightIcon aria-hidden="true" />
          </>
        ) : (
          "Got it"
        ))}
    </button>
  );
}

export function RichTooltipClose({
  className,
  children,
  ...props
}: Omit<ComponentProps<typeof PopoverPrimitive.Close>, "style"> & {
  style?: CSSProperties & RichTooltipKnobStyle & PopupKnobStyle;
}) {
  return (
    <PopoverPrimitive.Close
      data-control-ui="rich-tooltip"
      data-control-family="popup"
      data-popup-kind="rich-tooltip"
      data-slot="close"
      className={cn(actionClasses, className)}
      {...props}
    >
      {children ?? (
        <>
          <XIcon aria-hidden="true" />
          <span className="sr-only">Dismiss</span>
        </>
      )}
    </PopoverPrimitive.Close>
  );
}
