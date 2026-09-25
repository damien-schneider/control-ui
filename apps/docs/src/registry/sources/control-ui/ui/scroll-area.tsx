"use client";

import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";
import type { ComponentProps, CSSProperties, Ref } from "react";
import type { ScrollAreaKnobStyle } from "@/components/control-ui/knob-contracts/scroll-area-knobs";
import { cn } from "@/components/control-ui/lib/cn";
import { useSkin } from "@/components/control-ui/skin-provider";
import { ProgressiveBlur, type ProgressiveBlurProps } from "@/components/control-ui/ui/progressive-blur";

export const scrollAreaScrollbarVisibilities = ["scroll", "hover", "always"] as const;

export type ScrollAreaScrollbarVisibility = (typeof scrollAreaScrollbarVisibilities)[number];

export type ScrollAreaLockAxis = "x" | "y" | "both";

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
};

function Scrollbar({
  orientation,
  visibility,
  thumbStyle,
}: {
  orientation: "vertical" | "horizontal";
  visibility: ScrollAreaProps["scrollbarVisibility"];
  thumbStyle?: CSSProperties & ScrollAreaKnobStyle;
}) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      orientation={orientation}
      data-control-ui="scroll-area"
      data-control-family="scroll-area"
      data-slot="scrollbar"
      data-visibility={visibility}
      className={cn("m-px flex touch-none select-none", orientation === "vertical" ? "justify-center" : "flex-col")}
    >
      <ScrollAreaPrimitive.Thumb
        data-control-ui="scroll-area"
        data-control-family="scroll-area"
        data-slot="thumb"
        className={cn("flex-1", orientation === "vertical" ? "w-full" : "h-full")}
        style={thumbStyle}
      />
    </ScrollAreaPrimitive.Scrollbar>
  );
}

function viewportStyle(maxHeight: ScrollAreaProps["maxHeight"], lockX: boolean, lockY: boolean): CSSProperties | undefined {
  if (!maxHeight && !lockX && !lockY) return undefined;
  return {
    ...(maxHeight ? { maxHeight } : {}),
    ...(lockX ? { overflowX: "hidden" } : {}),
    ...(lockY ? { overflowY: "hidden" } : {}),
  };
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
  scrollbarVisibility = "hover",
  children,
  style,
  ...props
}: ScrollAreaProps) {
  const skin = useSkin();
  const resolvedBlur = blur ?? skin.scrollAreaBlur ?? false;
  const lockX = lockAxis === "x" || lockAxis === "both";
  const lockY = lockAxis === "y" || lockAxis === "both";
  const resolvedViewportStyle = viewportStyle(maxHeight, lockX, lockY);
  const { style: viewportPropsStyle, ...resolvedViewportProps } = viewportProps ?? {};
  const mergedViewportStyle = viewportPropsStyle || resolvedViewportStyle ? { ...viewportPropsStyle, ...resolvedViewportStyle } : undefined;
  const thumbStyle = style;
  const cornerStyle = style;

  return (
    <ScrollAreaPrimitive.Root
      {...props}
      data-control-ui="scroll-area"
      data-control-family="scroll-area"
      data-slot="root"
      data-mask={mask || undefined}
      data-blur={resolvedBlur || undefined}
      data-lock-axis={lockAxis}
      className={cn("relative overflow-hidden", className)}
      style={style}
    >
      <ScrollAreaPrimitive.Viewport
        data-control-ui="scroll-area"
        data-control-family="scroll-area"
        data-slot="viewport"
        {...resolvedViewportProps}
        data-scroll-area-viewport=""
        ref={viewportRef}
        className={cn("h-full w-full", viewportClassName)}
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
      {resolvedBlur && !lockY && <ProgressiveBlur {...blurProps} side="top" visible={false} />}
      {resolvedBlur && !lockY && <ProgressiveBlur {...blurProps} side="bottom" visible={false} />}
      {resolvedBlur && !lockX && <ProgressiveBlur {...blurProps} side="inline-start" visible={false} />}
      {resolvedBlur && !lockX && <ProgressiveBlur {...blurProps} side="inline-end" visible={false} />}
      {!lockY && <Scrollbar orientation="vertical" visibility={scrollbarVisibility} thumbStyle={thumbStyle} />}
      {!lockX && <Scrollbar orientation="horizontal" visibility={scrollbarVisibility} thumbStyle={thumbStyle} />}
      {!lockX && !lockY && (
        <ScrollAreaPrimitive.Corner
          data-control-ui="scroll-area"
          data-control-family="scroll-area"
          data-slot="corner"
          style={cornerStyle}
        />
      )}
    </ScrollAreaPrimitive.Root>
  );
}
