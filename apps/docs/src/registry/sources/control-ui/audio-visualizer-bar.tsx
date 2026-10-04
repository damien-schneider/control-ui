import type { CSSProperties } from "react";
import type { AudioVisualizerProps } from "@/components/control-ui/audio-visualizer";
import { audioVisualizerBands } from "@/components/control-ui/lib/audio-visualizer-levels";
import { cn } from "@/components/control-ui/lib/cn";

export type BarAudioVisualizerProps = AudioVisualizerProps & {
  align?: "center" | "start" | "end";
  mirrored?: boolean;
  idle?: "static" | "pulse" | "wave";
  loading?: boolean;
};

type BarStyle = CSSProperties & {
  "--_audio-visualizer-level-opacity": string;
  "--_audio-visualizer-delay": string;
};

export function AudioVisualizer({
  levels,
  points,
  active = true,
  align = "center",
  mirrored = false,
  idle = "static",
  loading = false,
  className,
  style,
  ...props
}: BarAudioVisualizerProps) {
  const visible = audioVisualizerBands(levels, points, active && !loading, mirrored);
  const hasSignal = active && !loading && visible.some(({ level }) => level > 0);
  const labelled = Boolean(props["aria-label"] || props["aria-labelledby"]);

  return (
    <div
      data-control-ui="audio-visualizer"
      data-control-family="audio-visualizer"
      data-slot="root"
      data-variant="bar"
      data-align={align}
      data-mirrored={mirrored ? "true" : undefined}
      data-active={hasSignal ? "true" : undefined}
      data-loading={loading ? "true" : undefined}
      data-idle={idle}
      role={labelled ? "img" : undefined}
      aria-hidden={labelled ? undefined : true}
      aria-busy={loading || undefined}
      className={cn("shrink-0 overflow-hidden", className)}
      style={style}
      {...props}
    >
      <span
        data-control-ui="audio-visualizer"
        data-control-family="audio-visualizer"
        data-slot="track"
        data-active={hasSignal || loading ? "true" : undefined}
      >
        {visible.map(({ key, level }, index) => {
          const amplitude = Math.sqrt(level);
          const barStyle: BarStyle = {
            height: `${(0.08 + amplitude * 0.92) * 100}%`,
            "--_audio-visualizer-level-opacity": `${0.48 + amplitude * 0.52}`,
            "--_audio-visualizer-delay": `${-index * 70}ms`,
          };

          return (
            <span
              key={key}
              data-control-ui="audio-visualizer"
              data-control-family="audio-visualizer"
              data-slot="bar"
              data-index={index}
              style={barStyle}
            />
          );
        })}
      </span>
    </div>
  );
}
