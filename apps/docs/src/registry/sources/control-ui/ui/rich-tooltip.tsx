"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";
import type { ComponentProps, CSSProperties, ReactNode, Ref, RefObject } from "react";
import { createContext, useContext, useEffect, useEffectEvent, useId, useRef, useState } from "react";
import type { PopupKnobStyle } from "@/components/control-ui/knob-contracts/popup-knobs";
import type { RichTooltipKnobStyle } from "@/components/control-ui/knob-contracts/rich-tooltip-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { prefersReducedMotion } from "@/components/control-ui/lib/motion";
import { PopupArrowShape } from "@/components/control-ui/popup-parts";
import { skinScopeAttributes } from "@/components/control-ui/skin";
import { useSkin } from "@/components/control-ui/skin-provider";
import { stepAfter, stepBefore, type TourPosition, tourPosition } from "./rich-tooltip-tour";

export type RichTooltipTone = "accent" | "surface";

export type RichTooltipProgressVariant = "count" | "dots";

type RichTooltipContentKnobStyle = RichTooltipKnobStyle & PopupKnobStyle;

/** `completed` when the last step is passed or `finish()` is called, `dismissed` when a step is closed, escaped or pressed away from. */
export type TourEndReason = "completed" | "dismissed";

export type TourValue = TourPosition & {
  activeStep: string | null;
  next: () => void;
  previous: () => void;
  goTo: (step: string) => void;
  finish: (reason?: TourEndReason) => void;
};

const TourContext = createContext<TourValue | null>(null);

export function useTour() {
  return useContext(TourContext);
}

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
  } catch {}
}

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
  onComplete?: (reason: TourEndReason) => void;
  storageKey?: string;
  children?: ReactNode;
};

export function RichTooltipTour({ steps, step, defaultStep, onStepChange, onComplete, storageKey, children }: RichTooltipTourProps) {
  const [navigatedStep, setNavigatedStep] = useState<string | null | undefined>();
  const autoStart = useSeenGate(storageKey, step === undefined);
  const initialStep = autoStart ? (defaultStep ?? steps[0] ?? null) : null;
  const uncontrolledStep = navigatedStep === undefined ? initialStep : navigatedStep;
  const activeStep = step === undefined ? uncontrolledStep : step;

  function setStep(next: string | null, endReason: TourEndReason = "completed") {
    if (next === activeStep) return;
    if (step === undefined) setNavigatedStep(next);
    onStepChange?.(next);
    if (next === null) {
      writeSeen(storageKey);
      onComplete?.(endReason);
    }
  }

  const position = tourPosition(steps, activeStep);
  const value: TourValue = {
    activeStep,
    ...position,
    next: () => setStep(stepAfter(steps, position.index)),
    previous: () => setStep(stepBefore(steps, position.index)),
    goTo: (target) => setStep(target),
    finish: (reason) => setStep(null, reason),
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

type RichTooltipContextValue = {
  tone: RichTooltipTone;
  tour: TourValue | null;
  open: boolean;
  dismiss: () => void;
  nextRef: RefObject<HTMLButtonElement | null>;
  descriptionId: string | undefined;
  setDescriptionId: (id: string | undefined) => void;
  progressId: string | undefined;
  setProgressId: (id: string | undefined) => void;
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
  dismissOnFocusOut?: boolean;
  trapFocus?: boolean;
};

export function RichTooltip({
  step,
  tone = "accent",
  storageKey,
  dismissOnOutsidePress = false,
  dismissOnFocusOut = false,
  trapFocus = false,
  open,
  defaultOpen = true,
  onOpenChange,
  children,
  ...props
}: RichTooltipProps) {
  const surroundingTour = useTour();
  const tour = step === undefined ? null : surroundingTour;
  const [readerOpen, setReaderOpen] = useState<boolean | undefined>();
  const autoOpen = useSeenGate(storageKey, open === undefined && tour === null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const [descriptionId, setDescriptionId] = useState<string | undefined>();
  const [progressId, setProgressId] = useState<string | undefined>();

  const resolvedOpen = open ?? (tour ? tour.activeStep === step : (readerOpen ?? (defaultOpen && autoOpen)));

  function reveal() {
    if (tour === null) setReaderOpen(true);
    else if (step !== undefined) tour.goTo(step);
  }

  function dismiss() {
    if (tour) {
      tour.finish("dismissed");
      return;
    }
    setReaderOpen(false);
    writeSeen(storageKey);
  }

  const handleOpenChange: NonNullable<RichTooltipProps["onOpenChange"]> = (nextOpen, details) => {
    if (!dismissOnOutsidePress && details.reason === "outside-press") return;
    if (!dismissOnFocusOut && details.reason === "focus-out") return;
    onOpenChange?.(nextOpen, details);
    if (nextOpen) reveal();
    else dismiss();
  };

  const context: RichTooltipContextValue = {
    tone,
    tour,
    open: resolvedOpen,
    dismiss,
    nextRef,
    descriptionId,
    setDescriptionId,
    progressId,
    setProgressId,
  };

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
  const scrollToAnchor = useEffectEvent(() => {
    const element = resolveAnchorElement(anchor);
    element?.scrollIntoView({ block: "center", inline: "nearest", behavior: prefersReducedMotion(element) ? "auto" : "smooth" });
  });
  useEffect(() => {
    if (open && enabled) scrollToAnchor();
  }, [enabled, open]);
}

const richTooltipContentSelector = '[data-control-ui="rich-tooltip"][data-slot="content"]';

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
  container?: ComponentProps<typeof PopoverPrimitive.Portal>["container"];
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
  container,
  ...props
}: RichTooltipContentProps) {
  const skin = useSkin();
  const { tone, tour, open, nextRef, descriptionId, progressId } = useRichTooltipContext();
  const isSurface = tone === "surface";
  useAnchorScroll(anchor, open, scrollAnchorIntoView);
  const describedBy = [descriptionId, progressId].filter(Boolean).join(" ") || undefined;

  const initialFocus: RichTooltipContentProps["initialFocus"] = (openType) => {
    const active = document.activeElement;
    const openedWithoutInteraction = !openType;
    const focusIsElsewhere = active !== null && active !== document.body && active.closest(richTooltipContentSelector) === null;
    if (openedWithoutInteraction && focusIsElsewhere) return false;
    return tour && nextRef.current ? nextRef.current : true;
  };

  return (
    <PopoverPrimitive.Portal container={container}>
      <PopoverPrimitive.Positioner
        data-control-ui="rich-tooltip"
        data-popup-kind="rich-tooltip"
        data-control-family="popup"
        data-slot="positioner"
        {...skinScopeAttributes(skin)}
        side={side}
        align={align}
        sideOffset={sideOffset}
        anchor={anchor}
        collisionPadding={collisionPadding}
        className="z-(--z-popup)"
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
          initialFocus={initialFocus}
          aria-describedby={describedBy}
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
              className="flex"
            >
              <PopupArrowShape />
            </PopoverPrimitive.Arrow>
          ) : null}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

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
  const { tone, setDescriptionId } = useRichTooltipContext();
  const generatedId = useId();
  const id = props.id ?? generatedId;
  useEffect(() => {
    setDescriptionId(id);
    return () => setDescriptionId(undefined);
  }, [id, setDescriptionId]);
  return (
    <PopoverPrimitive.Description
      id={id}
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
  label?: string;
  style?: CSSProperties & RichTooltipKnobStyle & PopupKnobStyle;
};

export function RichTooltipProgress({ className, variant = "count", label, children, ...props }: RichTooltipProgressProps) {
  const { tone, tour, setProgressId } = useRichTooltipContext();
  const statusId = useId();
  const rendered = tour !== null && tour.total >= 2 && tour.index >= 0;
  useEffect(() => {
    if (!rendered) return;
    setProgressId(statusId);
    return () => setProgressId(undefined);
  }, [rendered, statusId, setProgressId]);
  if (!tour || !rendered) return null;

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
      <span id={statusId} className="sr-only">
        {label ?? `Step ${tour.index + 1} of ${tour.total}`}
      </span>
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
            />
          ))
        ) : (
          <span aria-hidden="true">{`${tour.index + 1}/${tour.total}`}</span>
        ))}
    </div>
  );
}

function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") ref(node);
  else if (ref) ref.current = node;
}

const actionClasses = "inline-flex shrink-0 items-center justify-center";

export function RichTooltipPrevious({
  className,
  children,
  label = "Previous step",
  onClick,
  ...props
}: Omit<ComponentProps<"button">, "style"> & {
  style?: CSSProperties & RichTooltipKnobStyle & PopupKnobStyle;
  label?: string;
}) {
  const { tour } = useRichTooltipContext();
  if (!tour || tour.total < 2) return null;

  return (
    <button
      type="button"
      data-control-ui="rich-tooltip"
      data-control-family="popup"
      data-popup-kind="rich-tooltip"
      data-slot="previous"
      data-icon-only={children === undefined ? "true" : undefined}
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
          <ChevronLeftIcon aria-hidden="true" data-icon-dir="inline" />
          <span className="sr-only">{label}</span>
        </>
      )}
    </button>
  );
}

export function RichTooltipNext({
  className,
  children,
  nextLabel = "Next step",
  finishLabel = "Finish",
  gotItLabel = "Got it",
  onClick,
  ref,
  ...props
}: Omit<ComponentProps<"button">, "style"> & {
  style?: CSSProperties & RichTooltipKnobStyle & PopupKnobStyle;
  nextLabel?: string;
  finishLabel?: string;
  gotItLabel?: string;
}) {
  const { dismiss, nextRef, tour } = useRichTooltipContext();
  const setRef = (node: HTMLButtonElement | null) => {
    nextRef.current = node;
    assignRef(ref, node);
  };

  return (
    <button
      type="button"
      data-control-ui="rich-tooltip"
      data-control-family="popup"
      data-popup-kind="rich-tooltip"
      data-slot="next"
      data-icon-only={children === undefined && tour ? "true" : undefined}
      ref={setRef}
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
            <span className="sr-only">{tour.isLast ? finishLabel : nextLabel}</span>
            {tour.isLast ? <CheckIcon aria-hidden="true" /> : <ChevronRightIcon aria-hidden="true" data-icon-dir="inline" />}
          </>
        ) : (
          gotItLabel
        ))}
    </button>
  );
}

export function RichTooltipClose({
  className,
  children,
  label,
  ...props
}: Omit<ComponentProps<typeof PopoverPrimitive.Close>, "style"> & {
  style?: CSSProperties & RichTooltipKnobStyle & PopupKnobStyle;
  label?: string;
}) {
  const { tour } = useRichTooltipContext();
  return (
    <PopoverPrimitive.Close
      data-control-ui="rich-tooltip"
      data-control-family="popup"
      data-popup-kind="rich-tooltip"
      data-slot="close"
      data-icon-only={children === undefined ? "true" : undefined}
      className={cn(actionClasses, className)}
      {...props}
    >
      {children ?? (
        <>
          <XIcon aria-hidden="true" />
          <span className="sr-only">{label ?? (tour ? "End tour" : "Dismiss")}</span>
        </>
      )}
    </PopoverPrimitive.Close>
  );
}
