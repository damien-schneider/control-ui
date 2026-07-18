import type { CSSProperties } from "react";

import type { AudioVisualizerProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

// BARS version of the audio-visualizer usage family (the default). audio-visualizer-line.tsx is the sibling
// version: same `AudioVisualizer` export, same AudioVisualizerProps contract (contracts.ts), different rendering —
// installing either gives you <AudioVisualizer />, and swapping versions is an import-path change only.
// Levels-driven and runtime-agnostic: feed it any rolling 0..1 window (AnalyserNode RMS, runner audio stream, …).

type AudioVisualizerLevelStyle = CSSProperties & Record<"--audio-visualizer-inset", string>;

const DEFAULT_POINTS = 28;
const MAX_POINTS = 128;
const MIN_VISIBLE_LEVEL = 0.12;

// Kept local so either visualizer version installs as a complete, independent usage choice.
function resolveAudioVisualizerLevels(levels: readonly number[], points?: number) {
  const requestedPoints = Number.isFinite(points) ? Math.floor(points ?? DEFAULT_POINTS) : DEFAULT_POINTS;
  const pointCount = Math.min(MAX_POINTS, Math.max(1, requestedPoints));
  const visible = levels.slice(-pointCount).map((level) => (Number.isFinite(level) ? Math.min(1, Math.max(0, level)) : 0));
  const padded = visible.length === pointCount ? visible : [...new Array<number>(pointCount - visible.length).fill(0), ...visible];
  return padded.map((level, position) => ({ key: `bar-${position}`, level }));
}

export function AudioVisualizer({ levels, points, active = true, className, ...props }: AudioVisualizerProps) {
  const visible = resolveAudioVisualizerLevels(levels, points);

  return (
    <div
      data-control-ui="audio-visualizer"
      data-slot="root"
      data-variant="bars"
      data-active={active ? "true" : undefined}
      aria-hidden="true"
      className={cn(
        "h-7 w-44 shrink-0 overflow-hidden rounded-[var(--radius-control)] px-1.5 py-1.5",
        skinSlot("audio-visualizer", "root", { variant: "bars" }),
        className,
      )}
      {...props}
    >
      <span
        data-control-ui="audio-visualizer"
        data-slot="track"
        data-active={active ? "true" : undefined}
        className="flex size-full items-stretch justify-end gap-px opacity-55 mask-l-from-90% transition-opacity duration-[var(--duration-base)] ease-[var(--ease-standard)] data-[active=true]:opacity-100"
      >
        {visible.map(({ key, level }) => {
          const perceptualLevel = Math.sqrt(level);
          const visibleLevel = MIN_VISIBLE_LEVEL + perceptualLevel * (1 - MIN_VISIBLE_LEVEL);
          const levelStyle: AudioVisualizerLevelStyle = {
            "--audio-visualizer-inset": `${(1 - visibleLevel) * 50}%`,
            opacity: 0.48 + perceptualLevel * 0.52,
          };

          return (
            <span
              key={key}
              data-control-ui="audio-visualizer"
              data-slot="bar-track"
              className="flex w-1 shrink-0 translate-x-0 items-center opacity-100 blur-none transition-[opacity,filter,translate] duration-[var(--duration-base)] ease-[var(--ease-emphasized)] starting:translate-x-1 starting:opacity-0 starting:blur-xs"
            >
              <span
                data-control-ui="audio-visualizer"
                data-slot="bar"
                className="block h-full w-full rounded-[var(--radius-control)] bg-primary/80 [clip-path:inset(var(--audio-visualizer-inset)_0_round_var(--radius-control))] transition-[clip-path,opacity] duration-[var(--duration-base)] ease-[var(--ease-standard)]"
                style={levelStyle}
              />
            </span>
          );
        })}
      </span>
    </div>
  );
}
