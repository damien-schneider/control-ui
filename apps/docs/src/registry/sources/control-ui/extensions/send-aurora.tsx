"use client";

import type { CSSProperties } from "react";

import { cn } from "@/components/control-ui/lib/cn";

// Anchored extension for ChatComposer's `chat-composer:send-layer` anchor: a blurred aurora backdrop that sweeps up
// once per sent message. Activate it from skin.config — the component owns the anchor's positioned wrapper:
//   adornments: { "chat-composer": { "send-layer": (ctx) => <SendAurora sendCount={ctx.sendCount} /> } }
// One-shot replay is CSS-only: `key={sendCount}` remounts the layer per send, send-aurora.css plays the sweep
// keyframe on mount and parks it at opacity 0. Palette comes from the --aurora-1..5 tokens (skin re-valuable);
// the `colors` prop is the caller-wins inline override.

export type SendAuroraProps = {
  /** From the anchor ctx — increments on each successful submit; 0 renders nothing. */
  sendCount: number;
  /** Optional inline palette override for the five --aurora-* tokens (top to bottom band). */
  colors?: readonly [string, string, string, string, string];
};

// Literal classes so Tailwind's scanner sees every band; order = top → bottom of a column.
const AURORA_BAND_CLASSES = [
  "w-full flex-1 bg-(--aurora-1) blur-xl",
  "w-full flex-1 bg-(--aurora-2) blur-xl",
  "w-full flex-1 bg-(--aurora-3) blur-xl",
  "w-full flex-1 bg-(--aurora-4) blur-xl",
  "w-full flex-1 bg-(--aurora-5) blur-xl",
] as const;

// Middle column rides higher so the bands weave instead of aligning into stripes.
const AURORA_COLUMNS = [
  { id: "left", className: "" },
  { id: "center", className: "-translate-y-20" },
  { id: "right", className: "" },
] as const;

type AuroraPaletteStyle = CSSProperties & Record<"--aurora-1" | "--aurora-2" | "--aurora-3" | "--aurora-4" | "--aurora-5", string>;

export function SendAurora({ sendCount, colors }: SendAuroraProps) {
  if (sendCount === 0) return null;

  const paletteOverride: AuroraPaletteStyle | undefined = colors
    ? {
        "--aurora-1": colors[0],
        "--aurora-2": colors[1],
        "--aurora-3": colors[2],
        "--aurora-4": colors[3],
        "--aurora-5": colors[4],
      }
    : undefined;

  return (
    <div key={sendCount} data-send-aurora="" className="flex size-full items-stretch" style={paletteOverride}>
      {AURORA_COLUMNS.map((column) => (
        <div key={column.id} className={cn("flex h-full w-full flex-col items-stretch -space-y-3", column.className)}>
          {AURORA_BAND_CLASSES.map((bandClass) => (
            <div key={bandClass} className={bandClass} />
          ))}
        </div>
      ))}
    </div>
  );
}
