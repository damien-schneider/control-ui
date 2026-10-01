"use client";

import type { CSSProperties } from "react";

export type SendAuroraProps = {
  sendCount: number;
  colors?: readonly [string, string, string, string, string];
};

const AURORA_BANDS = [1, 2, 3, 4, 5] as const;
const AURORA_COLUMNS = ["left", "center", "right"] as const;

type AuroraPaletteStyle = CSSProperties &
  Record<
    "--_send-aurora-band-1" | "--_send-aurora-band-2" | "--_send-aurora-band-3" | "--_send-aurora-band-4" | "--_send-aurora-band-5",
    string
  >;

export function SendAurora({ sendCount, colors }: SendAuroraProps) {
  if (sendCount === 0) return null;

  const paletteOverride: AuroraPaletteStyle | undefined = colors
    ? {
        "--_send-aurora-band-1": colors[0],
        "--_send-aurora-band-2": colors[1],
        "--_send-aurora-band-3": colors[2],
        "--_send-aurora-band-4": colors[3],
        "--_send-aurora-band-5": colors[4],
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
