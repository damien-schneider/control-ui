"use client";

import type { ComponentProps, CSSProperties } from "react";
import { useLayoutEffect, useRef } from "react";
import type { AudioVisualizerKnobStyle } from "@/components/control-ui/knob-contracts/audio-visualizer-knobs";
import { audioVisualizerHistory } from "@/components/control-ui/lib/audio-visualizer-levels";
import { cn } from "@/components/control-ui/lib/cn";

export type AudioVisualizerProps = Omit<ComponentProps<"div">, "children" | "style"> & {
  levels: ArrayLike<number>;
  active?: boolean;
  points?: number;
  style?: CSSProperties & AudioVisualizerKnobStyle;
};

type AudioVisualizerLevelStyle = CSSProperties & Record<"--_audio-visualizer-level-opacity", string>;

const MIN_VISIBLE_LEVEL = 0.04;

type HistorySample = { levels: number[]; time: number; active: boolean };

function historyAdvanced(previous: HistorySample | null, next: HistorySample) {
  if (!previous?.active || !next.active || previous.levels.length !== next.levels.length || next.levels.length < 2) return false;
  const moved = previous.levels.slice(1).every((level, index) => level === next.levels[index]);
  const changed = previous.levels.some((level, index) => level !== next.levels[index]);
  return moved && changed;
}

export function AudioVisualizer({ levels, points, active = true, className, style, ...props }: AudioVisualizerProps) {
  const visible = audioVisualizerHistory(levels, points, active);
  const labelled = Boolean(props["aria-label"] || props["aria-labelledby"]);
  const trackRef = useRef<HTMLSpanElement | null>(null);
  const firstBarRef = useRef<HTMLSpanElement | null>(null);
  const previousSample = useRef<HistorySample | null>(null);

  useLayoutEffect(() => {
    const next = { levels: visible.map(({ level }) => level), time: performance.now(), active };
    const previous = previousSample.current;
    previousSample.current = next;
    const track = trackRef.current;
    const firstBar = firstBarRef.current;
    if (!track || !firstBar || !historyAdvanced(previous, next) || document.hidden) return;
    const duration = next.time - (previous?.time ?? next.time);
    if (duration < 16 || duration > 250 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const direction = getComputedStyle(track).direction === "rtl" ? -1 : 1;
    const pitch = (track.clientWidth - firstBar.clientWidth) / (visible.length - 1);
    const animation = track.animate([{ transform: `translateX(${pitch * direction}px)` }, { transform: "translateX(0)" }], {
      duration,
      easing: "linear",
    });
    return () => animation.cancel();
  }, [visible, active]);

  return (
    <div
      data-control-ui="audio-visualizer"
      data-control-family="audio-visualizer"
      data-slot="root"
      data-variant="bars"
      data-active={active ? "true" : undefined}
      role={labelled ? "img" : undefined}
      aria-hidden={labelled ? undefined : true}
      className={cn("shrink-0 overflow-hidden mask-x-from-90%", className)}
      style={style}
      {...props}
    >
      <span
        ref={trackRef}
        data-control-ui="audio-visualizer"
        data-control-family="audio-visualizer"
        data-slot="track"
        data-active={active ? "true" : undefined}
        className="flex size-full items-stretch justify-between"
      >
        {visible.map(({ key, level }) => {
          const perceptualLevel = Math.sqrt(level);
          const visibleLevel = MIN_VISIBLE_LEVEL + perceptualLevel * (1 - MIN_VISIBLE_LEVEL);
          const levelStyle: AudioVisualizerLevelStyle = {
            "--_audio-visualizer-level-opacity": `${0.48 + perceptualLevel * 0.52}`,
            clipPath: `inset(${(1 - visibleLevel) * 50}% 0 round var(--cui-audio-visualizer-bar-radius))`,
          };

          return (
            <span
              key={key}
              ref={key === "bar-0" ? firstBarRef : undefined}
              data-control-ui="audio-visualizer"
              data-control-family="audio-visualizer"
              data-slot="bar-track"
              className="flex items-center"
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
