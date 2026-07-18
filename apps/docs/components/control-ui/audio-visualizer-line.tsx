import type { CSSProperties } from "react";

import type { AudioVisualizerProps } from "@/components/control-ui/contracts";
import { cn } from "@/components/control-ui/lib/cn";
import { skinSlot } from "@/components/control-ui/skin";

// LINE version of the audio-visualizer usage family. audio-visualizer.tsx (bars) is the default sibling
// version: same `AudioVisualizer` export, same AudioVisualizerProps contract (contracts.ts), different rendering —
// installing either gives you <AudioVisualizer />, and swapping versions is an import-path change only.
// Draws the level window as a continuous mirrored SVG envelope, CSS-first: no canvas, no rAF.

const LINE_VIEWBOX_WIDTH = 100;
const LINE_VIEWBOX_HEIGHT = 32;
const LINE_CENTER = LINE_VIEWBOX_HEIGHT / 2;
const LINE_PADDING = 3;
const MIN_AMPLITUDE = 1.25;
const CURVE_TENSION = 0.18;
const DEFAULT_POINTS = 28;
const MAX_POINTS = 128;

type Point = { x: number; y: number };
type AudioVisualizerPathStyle = CSSProperties & { d: string };

// Kept local so either visualizer version installs as a complete, independent usage choice.
function resolveAudioVisualizerLevels(levels: readonly number[], points?: number) {
  const requestedPoints = Number.isFinite(points) ? Math.floor(points ?? DEFAULT_POINTS) : DEFAULT_POINTS;
  const pointCount = Math.min(MAX_POINTS, Math.max(1, requestedPoints));
  const visible = levels.slice(-pointCount).map((level) => (Number.isFinite(level) ? Math.min(1, Math.max(0, level)) : 0));
  return visible.length === pointCount ? visible : [...new Array<number>(pointCount - visible.length).fill(0), ...visible];
}

function smoothPath(points: readonly Point[]) {
  const [first, ...rest] = points;
  if (!first) return "";

  return rest.reduce(
    (path, point, index) => {
      const previous = points[index];
      const controlOffset = (point.x - previous.x) * CURVE_TENSION;
      return `${path} C ${(previous.x + controlOffset).toFixed(2)} ${previous.y.toFixed(2)}, ${(point.x - controlOffset).toFixed(2)} ${point.y.toFixed(2)}, ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
    },
    `M ${first.x.toFixed(2)} ${first.y.toFixed(2)}`,
  );
}

function envelopePath(levels: readonly number[]) {
  const step = LINE_VIEWBOX_WIDTH / Math.max(1, levels.length - 1);
  const maxAmplitude = LINE_CENTER - LINE_PADDING;
  const upper = levels.map((level, index) => ({
    x: index * step,
    y: LINE_CENTER - MIN_AMPLITUDE - Math.sqrt(level) * (maxAmplitude - MIN_AMPLITUDE),
  }));
  const lower = levels.map((level, index) => ({
    x: index * step,
    y: LINE_CENTER + MIN_AMPLITUDE + Math.sqrt(level) * (maxAmplitude - MIN_AMPLITUDE),
  }));
  const lowerReversed = [...lower].reverse();

  return `${smoothPath(upper)} L ${lowerReversed[0]?.x.toFixed(2) ?? 0} ${lowerReversed[0]?.y.toFixed(2) ?? LINE_CENTER}${smoothPath(lowerReversed).replace(/^M [^C]+/, "")} Z`;
}

export function AudioVisualizer({ levels, points, active = true, className, ...props }: AudioVisualizerProps) {
  const visible = resolveAudioVisualizerLevels(levels, points);
  const path = envelopePath(visible);
  const pathStyle: AudioVisualizerPathStyle = { d: `path('${path}')` };

  return (
    <div
      data-control-ui="audio-visualizer"
      data-slot="root"
      data-variant="line"
      data-active={active ? "true" : undefined}
      aria-hidden="true"
      className={cn(
        "h-7 w-44 shrink-0 overflow-hidden rounded-[var(--radius-control)] px-1.5",
        skinSlot("audio-visualizer", "root", { variant: "line" }),
        className,
      )}
      {...props}
    >
      <svg
        data-control-ui="audio-visualizer"
        data-slot="track"
        data-active={active ? "true" : undefined}
        viewBox={`0 0 ${LINE_VIEWBOX_WIDTH} ${LINE_VIEWBOX_HEIGHT}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        className="size-full overflow-visible opacity-55 transition-opacity duration-[var(--duration-base)] ease-[var(--ease-standard)] data-[active=true]:opacity-100"
      >
        <path d={`M 0 ${LINE_CENTER} H ${LINE_VIEWBOX_WIDTH}`} vectorEffect="non-scaling-stroke" className="stroke-border/55" />
        <path
          data-control-ui="audio-visualizer-line"
          data-slot="root"
          d={path}
          style={pathStyle}
          strokeWidth="1"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className="fill-primary/18 stroke-primary/80 transition-[d] duration-[var(--duration-base)] ease-[var(--ease-standard)]"
        />
      </svg>
    </div>
  );
}
