"use client";

import type { CSSProperties } from "react";

export type SendAuroraProps = {
  sendCount: number;
  colors?: readonly [string, string, string, string, string];
};

const AURORA_BANDS = [1, 2, 3, 4, 5] as const;
const AURORA_COLUMNS = ["left", "center", "right"] as const;

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
        <div key={column} data-column={column} className="flex h-full w-full flex-col items-stretch -space-y-3">
          {AURORA_BANDS.map((band) => (
            <div key={band} data-band={band} className="w-full flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
