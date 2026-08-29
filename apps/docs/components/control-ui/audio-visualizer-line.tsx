import type { CSSProperties } from "react";

import type { AudioVisualizerProps } from "@/components/control-ui/audio-visualizer";
import { cn } from "@/components/control-ui/lib/cn";

// Line reading. audio-visualizer.tsx exports same `AudioVisualizer` on same props, so swapping is import-path change.
// Drawn as mirrored SVG envelope — no canvas, no rAF.

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

// local so either visualizer installs as complete, independent choice
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
      const previous = points[index] ?? first;
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

export function AudioVisualizer({ levels, points, active = true, className, style, ...props }: AudioVisualizerProps) {
  const visible = resolveAudioVisualizerLevels(levels, points);
  const path = envelopePath(visible);
  const pathStyle: AudioVisualizerPathStyle = { d: `path('${path}')` };

  return (
    <div
      data-control-ui="audio-visualizer"
      data-control-family="audio-visualizer"
      data-slot="root"
      data-variant="line"
      data-active={active ? "true" : undefined}
      aria-hidden="true"
      className={cn("shrink-0 overflow-hidden", className)}
      style={style}
      {...props}
    >
      <svg
        data-control-ui="audio-visualizer"
        data-control-family="audio-visualizer"
        data-slot="track"
        data-active={active ? "true" : undefined}
        viewBox={`0 0 ${LINE_VIEWBOX_WIDTH} ${LINE_VIEWBOX_HEIGHT}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        className="size-full overflow-visible"
      >
        <path
          data-control-ui="audio-visualizer"
          data-control-family="audio-visualizer"
          data-slot="baseline"
          d={`M 0 ${LINE_CENTER} H ${LINE_VIEWBOX_WIDTH}`}
          vectorEffect="non-scaling-stroke"
        />
        <path
          data-control-ui="audio-visualizer-line"
          data-control-family="audio-visualizer"
          data-slot="waveform"
          d={path}
          style={pathStyle}
          strokeWidth="1"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
