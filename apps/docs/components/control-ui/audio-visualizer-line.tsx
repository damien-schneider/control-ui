import type { CSSProperties } from "react";

import type { AudioVisualizerProps } from "@/components/control-ui/audio-visualizer";
import { audioVisualizerHistory } from "@/components/control-ui/lib/audio-visualizer-levels";
import { cn } from "@/components/control-ui/lib/cn";

const LINE_VIEWBOX_WIDTH = 100;
const LINE_VIEWBOX_HEIGHT = 32;
const LINE_CENTER = LINE_VIEWBOX_HEIGHT / 2;
const LINE_PADDING = 3;
const MIN_AMPLITUDE = 0;
const CURVE_TENSION = 0.18;

type Point = { x: number; y: number };
type AudioVisualizerPathStyle = CSSProperties & { d: string };

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
  const envelope = levels.length === 1 ? [levels[0] ?? 0, levels[0] ?? 0] : levels;
  const step = LINE_VIEWBOX_WIDTH / Math.max(1, envelope.length - 1);
  const maxAmplitude = LINE_CENTER - LINE_PADDING;
  const upper = envelope.map((level, index) => ({
    x: index * step,
    y: LINE_CENTER - MIN_AMPLITUDE - Math.sqrt(level) * (maxAmplitude - MIN_AMPLITUDE),
  }));
  const lower = envelope.map((level, index) => ({
    x: index * step,
    y: LINE_CENTER + MIN_AMPLITUDE + Math.sqrt(level) * (maxAmplitude - MIN_AMPLITUDE),
  }));
  const lowerReversed = [...lower].reverse();

  return `${smoothPath(upper)} L ${lowerReversed[0]?.x.toFixed(2) ?? 0} ${lowerReversed[0]?.y.toFixed(2) ?? LINE_CENTER}${smoothPath(lowerReversed).replace(/^M [^C]+/, "")} Z`;
}

export function AudioVisualizer({ levels, points, active = true, className, style, ...props }: AudioVisualizerProps) {
  const visible = audioVisualizerHistory(levels, points, active).map(({ level }) => level);
  const path = envelopePath(visible);
  const pathStyle: AudioVisualizerPathStyle = { d: `path('${path}')` };
  const labelled = Boolean(props["aria-label"] || props["aria-labelledby"]);

  return (
    <div
      data-control-ui="audio-visualizer"
      data-control-family="audio-visualizer"
      data-slot="root"
      data-variant="line"
      data-active={active ? "true" : undefined}
      role={labelled ? "img" : undefined}
      aria-hidden={labelled ? undefined : true}
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
