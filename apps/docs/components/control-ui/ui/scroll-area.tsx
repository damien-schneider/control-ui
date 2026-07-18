"use client";

import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";
import type { CSSProperties } from "react";
import type { ScrollAreaProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

const maskXOverflowClasses = cn(
  "data-[overflow-x-start]:mask-l-from-[calc(100%_-_var(--scroll-fade-size))]",
  "data-[overflow-x-end]:mask-r-from-[calc(100%_-_var(--scroll-fade-size))]",
);

const maskYOverflowClasses = cn(
  "data-[overflow-y-start]:mask-t-from-[calc(100%_-_var(--scroll-fade-size))]",
  "data-[overflow-y-end]:mask-b-from-[calc(100%_-_var(--scroll-fade-size))]",
);

const scrollbarVisibilityClasses = {
  always: "opacity-100",
  hover: "opacity-0 transition-opacity duration-[var(--duration-fast)] data-[hovering]:opacity-100 data-[scrolling]:opacity-100",
  scroll: "opacity-0 transition-opacity duration-[var(--duration-fast)] data-[scrolling]:opacity-100",
};

function Scrollbar({
  orientation,
  visibility,
}: {
  orientation: "vertical" | "horizontal";
  visibility: ScrollAreaProps["scrollbarVisibility"];
}) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      orientation={orientation}
      data-control-ui="scroll-area"
      data-slot="scrollbar"
      className={cn(
        "m-px flex touch-none select-none",
        orientation === "vertical" ? "w-1.5 justify-center" : "h-1.5 flex-col",
        scrollbarVisibilityClasses[visibility ?? "scroll"],
        skinSlot("scroll-area", "scrollbar", { orientation }),
      )}
    >
      <ScrollAreaPrimitive.Thumb
        data-control-ui="scroll-area"
        data-slot="thumb"
        className={cn(
          "flex-1 rounded-full bg-foreground/25 transition-colors hover:bg-foreground/40",
          orientation === "vertical" ? "w-full" : "h-full",
          skinSlot("scroll-area", "thumb", {}),
        )}
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
  viewportProps,
  viewportRef,
  maxHeight,
  mask = true,
  lockAxis,
  scrollbarVisibility = "scroll",
  children,
  ...props
}: ScrollAreaProps) {
  const lockX = lockAxis === "x" || lockAxis === "both";
  const lockY = lockAxis === "y" || lockAxis === "both";
  const resolvedViewportStyle = viewportStyle(maxHeight, lockX, lockY);
  const { style: viewportPropsStyle, ...resolvedViewportProps } = viewportProps ?? {};
  const mergedViewportStyle = viewportPropsStyle || resolvedViewportStyle ? { ...viewportPropsStyle, ...resolvedViewportStyle } : undefined;

  return (
    <ScrollAreaPrimitive.Root
      data-control-ui="scroll-area"
      data-slot="root"
      className={cn("relative overflow-hidden", skinSlot("scroll-area", "root", {}), className)}
      {...props}
    >
      {/* Overscroll left at default (chaining) so wheel falls through to parent when viewport can't scroll further; `overscroll-contain` would trap it. */}
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        className={cn(
          "h-full w-full rounded-[inherit] outline-none",
          mask && !lockX && maskXOverflowClasses,
          mask && !lockY && maskYOverflowClasses,
          viewportClassName,
        )}
        style={mergedViewportStyle}
        {...resolvedViewportProps}
      >
        <ScrollAreaPrimitive.Content style={{ minWidth: 0 }}>{children}</ScrollAreaPrimitive.Content>
      </ScrollAreaPrimitive.Viewport>
      {!lockY && <Scrollbar orientation="vertical" visibility={scrollbarVisibility} />}
      {!lockX && <Scrollbar orientation="horizontal" visibility={scrollbarVisibility} />}
      {!lockX && !lockY && (
        <ScrollAreaPrimitive.Corner
          data-control-ui="scroll-area"
          data-slot="corner"
          className={cn("bg-transparent", skinSlot("scroll-area", "corner", {}))}
        />
      )}
    </ScrollAreaPrimitive.Root>
  );
}
