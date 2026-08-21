"use client";

import type { ComponentProps, CSSProperties, ReactNode, RefObject } from "react";
import { useEffect, useRef } from "react";
import { createTrackHighlight } from "@/components/control-ui/extensions/create-track-highlight";
import type { TrackHighlightKnobStyle } from "@/components/control-ui/knob-contracts/track-highlight-knobs";
import { cn } from "@/components/control-ui/lib/cn";

// Always-on tracks import this directly; skin-driven indicators lazy() it so geometry engine ships only when asked.

const trackHighlightStructureClasses = "pointer-events-none absolute -z-10";

export type TrackHighlightProps = Omit<ComponentProps<"div">, "children" | "ref" | "style"> & {
  /** Track container (`relative isolate`) highlight is measured against. Defaults to highlight's parent element. */
  trackRef?: RefObject<HTMLElement | null>;
  /** Selector for highlightable rows, resolved within track. */
  itemSelector?: string;
  /** Selector for resting row (active/selected) used when nothing is hovered. */
  activeSelector?: string;
  /** Span box across union of every active row (first..last) instead of single row. */
  range?: boolean;
  /** Follow pointer to hovered row; turn off for purely selection/scroll-driven box. */
  followHover?: boolean;
  /** Non-empty = second layer that follows hover while primary layer stays pinned on selection. */
  hoverClassName?: string;
  children?: ReactNode;
  style?: CSSProperties & TrackHighlightKnobStyle;
};

export function TrackHighlight({
  trackRef,
  itemSelector = "[data-track-item]",
  activeSelector = '[data-track-item][data-active="true"]',
  range,
  followHover,
  hoverClassName,
  className,
  style,
  children,
  ...props
}: TrackHighlightProps) {
  const ref = useRef<HTMLDivElement>(null);
  const hoverRef = useRef<HTMLDivElement>(null);
  const layered = Boolean(hoverClassName);

  useEffect(() => {
    const highlight = ref.current;
    const track = trackRef?.current ?? highlight?.parentElement;
    if (!track || !highlight) return;
    const hoverHighlight = layered ? (hoverRef.current ?? undefined) : undefined;
    return createTrackHighlight(track, highlight, { itemSelector, activeSelector, range, followHover }, hoverHighlight);
  }, [trackRef, itemSelector, activeSelector, range, followHover, layered]);

  return (
    <>
      <div
        {...props}
        ref={ref}
        data-control-ui="track-highlight"
        data-control-family="track-highlight"
        data-slot="root"
        aria-hidden
        style={style}
        className={cn(trackHighlightStructureClasses, className)}
      >
        {children}
      </div>
      {layered ? (
        <div
          ref={hoverRef}
          data-control-ui="track-highlight"
          data-control-family="track-highlight"
          data-slot="hover"
          aria-hidden
          style={style}
          className={cn(trackHighlightStructureClasses, hoverClassName)}
        />
      ) : null}
    </>
  );
}
