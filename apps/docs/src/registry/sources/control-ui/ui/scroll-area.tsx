"use client";

import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";
import { type ComponentProps, type CSSProperties, type Ref, type RefObject, useEffect, useRef } from "react";
import type { ScrollAreaKnobStyle } from "@/components/control-ui/knob-contracts/scroll-area-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { useSkin } from "@/components/control-ui/skin-provider";
import { ProgressiveBlur, type ProgressiveBlurProps } from "@/components/control-ui/ui/progressive-blur";

export const scrollAreaScrollbarVisibilities = ["scroll", "hover", "always"] as const;

export type ScrollAreaScrollbarVisibility = (typeof scrollAreaScrollbarVisibilities)[number];

export const scrollAreaScrollbarGutters = ["auto", "stable"] as const;

export type ScrollAreaScrollbarGutter = (typeof scrollAreaScrollbarGutters)[number];

export type ScrollAreaLockAxis = "x" | "y" | "both";

type ScrollbarOrientation = "vertical" | "horizontal";

type ScrollbarEdge = "start" | "end";

const scrollbarButtonStepPx = 40;
const scrollbarButtonRepeatDelayMs = 400;
const scrollbarButtonRepeatIntervalMs = 50;

export type ScrollAreaViewportProps = Omit<ComponentProps<"div">, "children" | "className" | "ref"> & {
  "data-control-ui"?: string;
  "data-control-family"?: string;
  "data-slot"?: string;
  render?: ComponentProps<typeof ScrollAreaPrimitive.Viewport>["render"];
};

export type ScrollAreaProps = Omit<ComponentProps<"div">, "style"> & { style?: CSSProperties & ScrollAreaKnobStyle } & {
  viewportClassName?: string;
  contentClassName?: string;
  viewportProps?: ScrollAreaViewportProps;
  viewportRef?: Ref<HTMLDivElement>;
  maxHeight?: string;
  mask?: boolean;
  blur?: boolean;
  blurProps?: Pick<ProgressiveBlurProps, "style">;
  lockAxis?: ScrollAreaLockAxis;
  scrollbarVisibility?: ScrollAreaScrollbarVisibility;
  scrollbarGutter?: ScrollAreaScrollbarGutter;
  scrollbarButtons?: boolean;
};

function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") ref(node);
  else if (ref) ref.current = node;
}

function scrollViewportByStep(viewport: HTMLDivElement | null, orientation: ScrollbarOrientation, edge: ScrollbarEdge) {
  if (!viewport) return;
  const towardEnd = edge === "end" ? 1 : -1;
  if (orientation === "vertical") {
    viewport.scrollBy({ top: towardEnd * scrollbarButtonStepPx, behavior: "instant" });
    return;
  }
  const inlineSign = getComputedStyle(viewport).direction === "rtl" ? -1 : 1;
  viewport.scrollBy({ left: towardEnd * inlineSign * scrollbarButtonStepPx, behavior: "instant" });
}

function ScrollbarButton({
  viewportRef,
  orientation,
  edge,
}: {
  viewportRef: RefObject<HTMLDivElement | null>;
  orientation: ScrollbarOrientation;
  edge: ScrollbarEdge;
}) {
  const repeatTimer = useRef<number | undefined>(undefined);
  const stopRepeat = () => window.clearTimeout(repeatTimer.current);

  useEffect(() => () => window.clearTimeout(repeatTimer.current), []);

  return (
    <div
      data-control-ui="scroll-area"
      data-control-family="scroll-area"
      data-slot="scrollbar-button"
      data-orientation={orientation}
      data-edge={edge}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.stopPropagation();
        const button = event.currentTarget;
        button.setPointerCapture(event.pointerId);
        const step = (nextDelayMs: number) => {
          scrollViewportByStep(viewportRef.current, orientation, edge);
          repeatTimer.current = window.setTimeout(() => step(scrollbarButtonRepeatIntervalMs), nextDelayMs);
        };
        stopRepeat();
        step(scrollbarButtonRepeatDelayMs);
      }}
      onPointerUp={stopRepeat}
      onPointerCancel={stopRepeat}
      onLostPointerCapture={stopRepeat}
    >
      <svg viewBox="0 0 8 8" aria-hidden="true">
        <path d="M1 5.5 4 2.5 7 5.5" />
      </svg>
    </div>
  );
}

const inFlowGutterStyle: CSSProperties = {
  position: "relative",
  top: "auto",
  bottom: "auto",
  insetInlineStart: "auto",
  insetInlineEnd: "auto",
};

function Scrollbar({
  viewportRef,
  orientation,
  visibility,
  gutter,
  buttons,
}: {
  viewportRef: RefObject<HTMLDivElement | null>;
  orientation: ScrollbarOrientation;
  visibility: ScrollAreaProps["scrollbarVisibility"];
  gutter: ScrollAreaScrollbarGutter;
  buttons: boolean;
}) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      orientation={orientation}
      keepMounted={gutter === "stable"}
      data-control-ui="scroll-area"
      data-control-family="scroll-area"
      data-slot="scrollbar"
      data-visibility={visibility}
      data-buttons={buttons || undefined}
      className={cn("m-px flex touch-none select-none", orientation === "vertical" ? "justify-center" : "flex-col")}
      style={gutter === "stable" ? inFlowGutterStyle : undefined}
    >
      {buttons && <ScrollbarButton viewportRef={viewportRef} orientation={orientation} edge="start" />}
      <ScrollAreaPrimitive.Thumb
        data-control-ui="scroll-area"
        data-control-family="scroll-area"
        data-slot="thumb"
        className={cn("flex-1", orientation === "vertical" ? "w-full" : "h-full")}
      />
      {buttons && <ScrollbarButton viewportRef={viewportRef} orientation={orientation} edge="end" />}
    </ScrollAreaPrimitive.Scrollbar>
  );
}

function viewportStyle(
  baseStyle: CSSProperties | undefined,
  maxHeight: ScrollAreaProps["maxHeight"],
  lockX: boolean,
  lockY: boolean,
): CSSProperties | undefined {
  if (!maxHeight && !lockX && !lockY) return baseStyle;
  return {
    ...baseStyle,
    ...(maxHeight ? { maxHeight } : {}),
    ...(lockX ? { overflowX: "hidden" } : {}),
    ...(lockY ? { overflowY: "hidden" } : {}),
  };
}

function regionProps(ariaLabel: string | undefined, ariaLabelledby: string | undefined) {
  if (!ariaLabel && !ariaLabelledby) return {};
  return { role: "region", "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby };
}

function EdgeBlurs({ blurProps, lockX, lockY }: { blurProps: ScrollAreaProps["blurProps"]; lockX: boolean; lockY: boolean }) {
  return (
    <>
      {!lockY && <ProgressiveBlur {...blurProps} side="top" visible={false} />}
      {!lockY && <ProgressiveBlur {...blurProps} side="bottom" visible={false} />}
      {!lockX && <ProgressiveBlur {...blurProps} side="inline-start" visible={false} />}
      {!lockX && <ProgressiveBlur {...blurProps} side="inline-end" visible={false} />}
    </>
  );
}

export function ScrollArea({
  className,
  viewportClassName,
  contentClassName,
  viewportProps,
  viewportRef,
  maxHeight,
  mask = true,
  blur,
  blurProps,
  lockAxis,
  scrollbarVisibility,
  scrollbarGutter,
  scrollbarButtons,
  children,
  style,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  ...props
}: ScrollAreaProps) {
  const skin = useSkin();
  const resolvedBlur = blur ?? skin.scrollAreaBlur ?? false;
  const resolvedVisibility = scrollbarVisibility ?? skin.scrollAreaScrollbarVisibility ?? "hover";
  const resolvedGutter = scrollbarGutter ?? skin.scrollAreaScrollbarGutter ?? "auto";
  const resolvedButtons = scrollbarButtons ?? skin.scrollAreaScrollbarButtons ?? false;
  const lockX = lockAxis === "x" || lockAxis === "both";
  const lockY = lockAxis === "y" || lockAxis === "both";
  const { style: viewportPropsStyle, ...resolvedViewportProps } = viewportProps ?? {};
  const mergedViewportStyle = viewportStyle(viewportPropsStyle, maxHeight, lockX, lockY);
  const viewportElementRef = useRef<HTMLDivElement | null>(null);

  function attachViewport(node: HTMLDivElement | null) {
    viewportElementRef.current = node;
    assignRef(viewportRef, node);
  }

  return (
    <ScrollAreaPrimitive.Root
      {...props}
      data-control-ui="scroll-area"
      data-control-family="scroll-area"
      data-slot="root"
      data-mask={mask || undefined}
      data-blur={resolvedBlur || undefined}
      data-lock-axis={lockAxis}
      data-scrollbar-gutter={resolvedGutter}
      className={cn("relative overflow-hidden", className)}
      style={style}
    >
      <ScrollAreaPrimitive.Viewport
        data-control-ui="scroll-area"
        data-control-family="scroll-area"
        data-slot="viewport"
        {...resolvedViewportProps}
        {...regionProps(ariaLabel, ariaLabelledby)}
        data-scroll-area-viewport=""
        ref={attachViewport}
        className={viewportClassName}
        style={mergedViewportStyle}
      >
        <ScrollAreaPrimitive.Content
          data-control-ui="scroll-area"
          data-control-family="scroll-area"
          data-slot="content"
          className={contentClassName}
          style={{ minWidth: 0 }}
        >
          {children}
        </ScrollAreaPrimitive.Content>
      </ScrollAreaPrimitive.Viewport>
      {resolvedBlur && <EdgeBlurs blurProps={blurProps} lockX={lockX} lockY={lockY} />}
      {!lockY && (
        <Scrollbar
          viewportRef={viewportElementRef}
          orientation="vertical"
          visibility={resolvedVisibility}
          gutter={resolvedGutter}
          buttons={resolvedButtons}
        />
      )}
      {!lockX && (
        <Scrollbar
          viewportRef={viewportElementRef}
          orientation="horizontal"
          visibility={resolvedVisibility}
          gutter={resolvedGutter}
          buttons={resolvedButtons}
        />
      )}
      {!lockX && !lockY && (
        <ScrollAreaPrimitive.Corner
          data-control-ui="scroll-area"
          data-control-family="scroll-area"
          data-slot="corner"
          style={resolvedGutter === "stable" ? inFlowGutterStyle : undefined}
        />
      )}
    </ScrollAreaPrimitive.Root>
  );
}
