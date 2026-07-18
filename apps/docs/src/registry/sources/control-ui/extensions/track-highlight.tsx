"use client";

import type { ReactNode, RefObject } from "react";
import { useEffect, useRef } from "react";

import { createTrackHighlight } from "@/components/control-ui/extensions/create-track-highlight";
import { cn } from "@/components/control-ui/lib/cn";

// Import policy: always-on tracks (docs chrome, ToC) import this module directly; opt-in indicators
// (skin-driven sidebar/tree `slide`) lazy() it so the geometry engine ships only when a skin asks.

// Geometry/motion shared by both layers; paint stays per-layer below so a consumer overriding one
// (bg/ring/shadow) never drags the other along through tailwind-merge.
const trackHighlightBaseClasses =
  "pointer-events-none absolute -z-10 rounded-[var(--radius-popup-item)] opacity-0 transition-[top,left,right,bottom,opacity,background-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-standard)] data-[visible]:opacity-100";

// Rest = --track-highlight-* knobs (theme.css); data-hover (engine-stamped while chasing a non-active
// row) demotes to the hover wash so "sitting on active" and "visiting on hover" never read the same.
const trackHighlightRestClasses =
  "bg-(--track-highlight-bg) shadow-(--track-highlight-shadow) ring-1 ring-(--track-highlight-ring) data-[hover]:bg-(--track-highlight-hover-bg) data-[hover]:shadow-none data-[hover]:ring-transparent";

const trackHighlightHoverClasses = "bg-(--track-highlight-hover-bg)";

export type TrackHighlightProps = {
  /** Track container (`relative isolate`) the highlight is measured against. Defaults to the highlight's parent element. */
  trackRef?: RefObject<HTMLElement | null>;
  /** Selector for the highlightable rows, resolved within the track. */
  itemSelector?: string;
  /** Selector for the resting row (active/selected) used when nothing is hovered. */
  activeSelector?: string;
  /** Span the box across the union of every active row (first..last) instead of a single row. */
  range?: boolean;
  /** Follow the pointer to the hovered row; turn off for a purely selection/scroll-driven box. */
  followHover?: boolean;
  /** Non-empty = second layer that follows hover while the primary layer stays pinned on selection. */
  hoverClassName?: string;
  className?: string;
  children?: ReactNode;
};

export function TrackHighlight({
  trackRef,
  itemSelector = "[data-track-item]",
  activeSelector = '[data-track-item][data-active="true"]',
  range,
  followHover,
  hoverClassName,
  className,
  children,
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
        ref={ref}
        data-control-ui="track-highlight"
        data-slot="root"
        aria-hidden
        className={cn(trackHighlightBaseClasses, trackHighlightRestClasses, className)}
      >
        {children}
      </div>
      {layered ? (
        <div
          ref={hoverRef}
          data-control-ui="track-highlight"
          data-slot="hover"
          aria-hidden
          className={cn(trackHighlightBaseClasses, trackHighlightHoverClasses, hoverClassName)}
        />
      ) : null}
    </>
  );
}
