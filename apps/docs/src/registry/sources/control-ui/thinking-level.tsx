"use client";

import type { ComponentProps, PointerEvent, ReactNode } from "react";
import { useId, useRef, useState } from "react";
import { cn } from "@/components/control-ui/lib/cn";
import { Button } from "@/components/control-ui/ui/button";

export type ThinkingLevel = {
  value: string;
  label: string;
  hint?: ReactNode;
};

export type ThinkingLevelRampProps = {
  levels: readonly ThinkingLevel[];
  value: string | undefined;
  onValueChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
  /** A text button at the end of the label row, e.g. back to an inherited level. */
  reset?: { label: string; onClick: () => void };
  className?: string;
};

/** How many plain cells the picked cell spans once it widens to fit its name. */
const PICKED_GROW = 3.4;
/** How far the pill leans toward a hovered level. */
const LEAN_PX = 6;

const BRAIN_LOBES =
  "M7.3 3.2C7.3 2.4 6.6 1.9 5.8 2.1C5 1.8 4.1 2.3 4 3.2C2.9 3.4 2.3 4.4 2.6 5.4C1.7 6 1.5 7.3 2.1 8.1C1.5 9 1.8 10.3 2.8 10.7C2.9 11.8 3.8 12.6 4.9 12.5C5.4 13.4 6.5 13.8 7.3 13.2Z";
const BRAIN_TOP = 1.9;
const BRAIN_BOTTOM = 13.7;

const brain = (
  <>
    <path d={BRAIN_LOBES} />
    <path d={BRAIN_LOBES} transform="matrix(-1 0 0 1 16 0)" />
  </>
);

export function levelFill(levels: readonly { value: string }[], value: string | undefined) {
  const stop = levels.findIndex((level) => level.value === value);
  if (stop < 0) return 0;
  return levels.length > 1 ? stop / (levels.length - 1) : 1;
}

/** A brain filled from the bottom: empty at 0, full at 1. */
export function ThinkingLevelBrain({ depth, className, ...props }: Omit<ComponentProps<"svg">, "fill"> & { depth: number }) {
  const clipId = `thinking-${useId().replace(/[^\w-]/g, "")}`;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="currentColor"
      data-control-ui="thinking-level"
      data-control-family="thinking-level"
      data-slot="brain"
      className={className}
      {...props}
    >
      <clipPath id={clipId}>
        <rect y={Math.round((BRAIN_BOTTOM - (BRAIN_BOTTOM - BRAIN_TOP) * depth) * 100) / 100} width={16} height={16} />
      </clipPath>
      <g opacity={0.35}>{brain}</g>
      <g clipPath={`url(#${clipId})`}>{brain}</g>
    </svg>
  );
}

function leanToward(hovered: number | undefined, shown: number) {
  if (hovered === undefined || shown < 0 || hovered === shown) return 0;
  return hovered > shown ? LEAN_PX : -LEAN_PX;
}

/**
 * One brain per level, filled to its depth. The picked level widens into a pill carrying its name;
 * when it moves, the leading edge leaves first and the trailing edge follows.
 *
 * A hidden range input is the control for keyboards and assistive tech. Pointers land on the cells,
 * which are not evenly sized, and a drag only writes the level it ends on.
 */
export function ThinkingLevelRamp({
  levels,
  value,
  onValueChange,
  label = "Thinking",
  disabled = false,
  reset,
  className,
}: ThinkingLevelRampProps) {
  const settled = levels.findIndex((level) => level.value === value);
  const [dragged, setDragged] = useState<number>();
  const [hovered, setHovered] = useState<number>();
  const [forward, setForward] = useState(true);
  const cells = useRef<(HTMLSpanElement | null)[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const drag = useRef<number | undefined>(undefined);

  const shown = dragged ?? settled;
  const lastStop = Math.max(levels.length - 1, 0);
  const inert = disabled || levels.length === 0;
  const lean = leanToward(hovered, shown);
  const units = lastStop + PICKED_GROW;
  const edge = (span: number, offset: number) =>
    `calc(var(--_thinking-level-pad) + (100% - 2 * var(--_thinking-level-pad)) * ${span / units} + ${offset}px)`;

  function moveTo(stop: number) {
    if (stop !== shown) setForward(stop > shown);
    drag.current = stop;
    setDragged(stop);
  }

  function commit(stop: number | undefined) {
    drag.current = undefined;
    setDragged(undefined);
    const level = stop === undefined ? undefined : levels[stop];
    if (level && stop !== settled) onValueChange(level.value);
  }

  function stopAt(clientX: number) {
    let nearest: number | undefined;
    let nearestDistance = Number.POSITIVE_INFINITY;
    cells.current.forEach((cell, stop) => {
      if (!cell) return;
      const { left, right } = cell.getBoundingClientRect();
      const distance = Math.max(left - clientX, clientX - right, 0);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = stop;
      }
    });
    return nearest;
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (inert || event.button !== 0) return;
    const stop = stopAt(event.clientX);
    if (stop === undefined) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setHovered(undefined);
    input.current?.focus({ preventScroll: true, focusVisible: false });
    moveTo(stop);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (inert) return;
    const stop = stopAt(event.clientX);
    if (drag.current !== undefined) {
      if (stop !== undefined) moveTo(stop);
    } else if (event.pointerType === "mouse") {
      setHovered(stop);
    }
  }

  function onPointerEnd() {
    if (drag.current !== undefined) commit(drag.current);
  }

  return (
    <div
      data-control-ui="thinking-level"
      data-control-family="thinking-level"
      data-slot="root"
      aria-disabled={inert || undefined}
      className={cn("flex flex-col", className)}
    >
      <div
        data-control-ui="thinking-level"
        data-control-family="thinking-level"
        data-slot="header"
        className="flex items-center justify-between"
      >
        <span data-control-ui="thinking-level" data-control-family="thinking-level" data-slot="label">
          {label}
        </span>
        {reset ? (
          <Button variant="link" size="xs" onClick={reset.onClick}>
            {reset.label}
          </Button>
        ) : null}
      </div>
      <div
        data-control-ui="thinking-level"
        data-control-family="thinking-level"
        data-slot="track"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onLostPointerCapture={onPointerEnd}
        onPointerLeave={() => setHovered(undefined)}
        className="relative flex touch-pan-y select-none"
      >
        {shown >= 0 ? (
          <span
            aria-hidden="true"
            data-control-ui="thinking-level"
            data-control-family="thinking-level"
            data-slot="pill"
            className="absolute"
            style={{
              left: edge(shown, Math.min(lean, 0)),
              right: edge(lastStop - shown, -Math.max(lean, 0)),
              transitionDuration: forward ? "var(--duration-base), var(--duration-slow)" : "var(--duration-slow), var(--duration-base)",
            }}
          />
        ) : null}
        {levels.map((level, stop) => {
          const picked = stop === shown;
          return (
            <span
              key={level.value}
              ref={(cell) => {
                cells.current[stop] = cell;
              }}
              aria-hidden="true"
              data-control-ui="thinking-level"
              data-control-family="thinking-level"
              data-slot="stop"
              data-picked={picked ? "" : undefined}
              data-passed={shown >= 0 && stop < shown ? "" : undefined}
              className="relative flex min-w-0 basis-0 items-center justify-center"
              style={{ flexGrow: picked ? PICKED_GROW : 1 }}
            >
              <ThinkingLevelBrain depth={lastStop === 0 ? 1 : stop / lastStop} />
              <span data-control-ui="thinking-level" data-control-family="thinking-level" data-slot="stop-label">
                {level.label}
              </span>
            </span>
          );
        })}
        <input
          ref={input}
          type="range"
          min={0}
          max={lastStop}
          step={1}
          value={Math.max(shown, 0)}
          onChange={(event) => {
            const stop = Number(event.target.value);
            if (drag.current !== undefined) {
              moveTo(stop);
              return;
            }
            setForward(stop > shown);
            commit(stop);
          }}
          aria-label={label}
          aria-valuetext={levels[shown]?.label}
          disabled={inert}
          data-control-ui="thinking-level"
          data-control-family="thinking-level"
          data-slot="input"
          className="pointer-events-none absolute inset-0 size-full appearance-none"
        />
      </div>
    </div>
  );
}
