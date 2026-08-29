import type { ComponentProps, CSSProperties } from "react";
import type { AudioVisualizerKnobStyle } from "@/components/control-ui/knob-contracts/audio-visualizer-knobs";
import { cn } from "@/components/control-ui/lib/cn";

export type AudioVisualizerProps = Omit<ComponentProps<"div">, "children" | "style"> & {
  levels: readonly number[];
  active?: boolean;
  points?: number;
  style?: CSSProperties & AudioVisualizerKnobStyle;
};

// Bars reading. audio-visualizer-line.tsx exports same `AudioVisualizer` on same props, so swapping is import-path change.
// Runtime-agnostic — feed it any rolling 0..1 window.

type AudioVisualizerLevelStyle = CSSProperties & Record<"--_audio-visualizer-level-opacity", string>;

const DEFAULT_POINTS = 28;
const MAX_POINTS = 128;
const MIN_VISIBLE_LEVEL = 0.12;

// local so either visualizer installs as complete, independent choice
function resolveAudioVisualizerLevels(levels: readonly number[], points?: number) {
  const requestedPoints = Number.isFinite(points) ? Math.floor(points ?? DEFAULT_POINTS) : DEFAULT_POINTS;
  const pointCount = Math.min(MAX_POINTS, Math.max(1, requestedPoints));
  const visible = levels.slice(-pointCount).map((level) => (Number.isFinite(level) ? Math.min(1, Math.max(0, level)) : 0));
  const padded = visible.length === pointCount ? visible : [...new Array<number>(pointCount - visible.length).fill(0), ...visible];
  return padded.map((level, position) => ({ key: `bar-${position}`, level }));
}

export function AudioVisualizer({ levels, points, active = true, className, style, ...props }: AudioVisualizerProps) {
  const visible = resolveAudioVisualizerLevels(levels, points);

  return (
    <div
      data-control-ui="audio-visualizer"
      data-control-family="audio-visualizer"
      data-slot="root"
      data-variant="bars"
      data-active={active ? "true" : undefined}
      aria-hidden="true"
      className={cn("shrink-0 overflow-hidden", className)}
      style={style}
      {...props}
    >
      <span
        data-control-ui="audio-visualizer"
        data-control-family="audio-visualizer"
        data-slot="track"
        data-active={active ? "true" : undefined}
        className="flex size-full items-stretch justify-end mask-l-from-90%"
      >
        {visible.map(({ key, level }) => {
          const perceptualLevel = Math.sqrt(level);
          const visibleLevel = MIN_VISIBLE_LEVEL + perceptualLevel * (1 - MIN_VISIBLE_LEVEL);
          const levelStyle: AudioVisualizerLevelStyle = {
            "--_audio-visualizer-level-opacity": `${0.48 + perceptualLevel * 0.52}`,
            clipPath: `inset(${(1 - visibleLevel) * 50}% 0 round var(--radius-control))`,
          };

          return (
            <span
              key={key}
              data-control-ui="audio-visualizer"
              data-control-family="audio-visualizer"
              data-slot="bar-track"
              className="flex shrink-0 items-center"
            >
              <span
                data-control-ui="audio-visualizer"
                data-control-family="audio-visualizer"
                data-slot="bar"
                className="block h-full w-full"
                style={levelStyle}
              />
            </span>
          );
        })}
      </span>
    </div>
  );
}
