import type { TokenValues } from "./types";

export function LayerPreview({ values }: { values: TokenValues }) {
  const overlayOpacity = Number.parseFloat(values["--overlay-opacity"] ?? "");
  return (
    <div className="relative min-h-28 w-full overflow-hidden rounded-[var(--radius-control)] bg-canvas p-3 ring-1 ring-inset ring-border">
      <div
        className="absolute inset-0 bg-foreground backdrop-blur-[var(--backdrop-blur-overlay)]"
        style={{ opacity: Number.isNaN(overlayOpacity) ? 0.2 : overlayOpacity }}
      />
      <div className="relative ml-auto w-4/5 rounded-[var(--radius-popover)] bg-popover p-3 text-micro text-popover-foreground shadow-pop backdrop-blur-[var(--backdrop-blur-popover)]">
        Popover surface
      </div>
    </div>
  );
}
