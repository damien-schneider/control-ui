"use client";

import type { CSSProperties } from "react";

import { cn } from "@/components/control-ui/lib/cn";

// Activate from skin.config on ChatComposer's send-layer anchor:
//  adornments: { "chat-composer": { "send-layer": (ctx) => <SendAurora sendCount={ctx.sendCount} /> } }
// Replay is CSS-only: `key={sendCount}` remounts layer per send, and send-aurora.css plays sweep on mount.

export type SendAuroraProps = {
  /** From anchor ctx — increments on each successful submit; 0 renders nothing. */
  sendCount: number;
  /** Optional inline palette override for five --aurora-* tokens (top to bottom band). */
  colors?: readonly [string, string, string, string, string];
};

// literal classes so Tailwind's scanner sees every band; ordered top to bottom of column
const AURORA_BAND_CLASSES = [
  "w-full flex-1 bg-(--aurora-1) blur-xl",
  "w-full flex-1 bg-(--aurora-2) blur-xl",
  "w-full flex-1 bg-(--aurora-3) blur-xl",
  "w-full flex-1 bg-(--aurora-4) blur-xl",
  "w-full flex-1 bg-(--aurora-5) blur-xl",
] as const;

// rides higher so bands weave instead of aligning into stripes
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
