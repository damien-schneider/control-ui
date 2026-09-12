"use client";

import type { ComponentProps, CSSProperties, ReactNode, RefObject } from "react";
import { useEffect, useRef } from "react";
import { supportsAnchorTransitions } from "@/components/control-ui/extensions/supports-anchor-transitions";
import type { TrackHighlightKnobStyle } from "@/components/control-ui/knob-contracts/track-highlight-knobs";
import { cn } from "@/components/control-ui/lib/cn";

const trackHighlightStructureClasses = "pointer-events-none absolute -z-10";
const defaultItemSelector = "[data-track-item]";
const defaultActiveSelector = '[data-track-item][data-active="true"]';
const loadTrackHighlight = () => import("@/components/control-ui/extensions/create-track-highlight");

export type TrackHighlightProps = Omit<ComponentProps<"div">, "children" | "ref" | "style"> & {
  trackRef?: RefObject<HTMLElement | null>;
  itemSelector?: string;
  activeSelector?: string;
  range?: boolean;
  followHover?: boolean;
  hoverClassName?: string;
  children?: ReactNode;
  style?: CSSProperties & TrackHighlightKnobStyle;
};

export function TrackHighlight({
  trackRef,
  itemSelector = defaultItemSelector,
  activeSelector = defaultActiveSelector,
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
  const usesAnchorAnatomy =
    !trackRef &&
    !range &&
    !layered &&
    followHover !== false &&
    itemSelector === defaultItemSelector &&
    activeSelector === defaultActiveSelector;

  useEffect(() => {
    const highlight = ref.current;
    const track = trackRef?.current ?? highlight?.parentElement;
    if (!track || !highlight) return;
    const usesAnchors = usesAnchorAnatomy && track.hasAttribute("data-track") && supportsAnchorTransitions();
    if (usesAnchors) return;
    const hoverHighlight = layered ? (hoverRef.current ?? undefined) : undefined;
    let cancelled = false;
    let dispose: (() => void) | undefined;
    loadTrackHighlight().then(({ createTrackHighlight }) => {
      if (cancelled) return;
      dispose = createTrackHighlight(track, highlight, { itemSelector, activeSelector, range, followHover }, hoverHighlight);
    });
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [trackRef, itemSelector, activeSelector, range, followHover, layered, usesAnchorAnatomy]);

  return (
    <>
      <div
        {...props}
        ref={ref}
        data-control-ui="track-highlight"
        data-control-family="track-highlight"
        data-slot="root"
        data-positioning={usesAnchorAnatomy ? "anchor" : undefined}
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
