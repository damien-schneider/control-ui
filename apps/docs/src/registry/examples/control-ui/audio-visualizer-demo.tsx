"use client";

import type { ComponentType } from "react";
import { useEffect, useState } from "react";
import type { AudioVisualizerProps } from "@/components/control-ui/audio-visualizer";
import { Button } from "@/components/control-ui/ui/button";
import { Text } from "@/components/control-ui/ui/typography";

const WINDOW_SIZE = 48;

function speechLevel(frame: number) {
  const envelope = 0.55 + 0.45 * Math.sin(frame / 9.3);
  const detail = 0.5 + 0.28 * Math.sin(frame / 2.1) + 0.18 * Math.sin(frame / 0.9);
  return Math.min(1, Math.max(0, envelope * detail));
}

function frequencyLevels(frame: number) {
  return Array.from({ length: WINDOW_SIZE }, (_, index) => {
    const envelope = Math.exp(-index / 30) * (0.65 + Math.sin(frame / 9) * 0.3);
    return Math.min(1, Math.max(0, envelope * (0.5 + Math.sin(index * 0.5 + frame / 4) * 0.4)));
  });
}

export function useDemoAudioLevels(mode: "history" | "bands" = "history", active = true) {
  const [levels, setLevels] = useState(() =>
    mode === "bands" ? frequencyLevels(0) : Array.from({ length: WINDOW_SIZE }, (_, index) => speechLevel(index)),
  );

  useEffect(() => {
    if (!active) return;
    let frame = WINDOW_SIZE;
    let timer: ReturnType<typeof setInterval> | undefined;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    function restart() {
      clearInterval(timer);
      if (document.hidden) return;
      timer = setInterval(
        () => {
          frame += 1;
          setLevels((previous) => (mode === "bands" ? frequencyLevels(frame) : [...previous.slice(1), speechLevel(frame)]));
        },
        reducedMotion.matches ? 250 : 80,
      );
    }
    restart();
    document.addEventListener("visibilitychange", restart);
    reducedMotion.addEventListener("change", restart);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", restart);
      reducedMotion.removeEventListener("change", restart);
    };
  }, [mode, active]);

  return levels;
}

export function AudioVisualizerDemo({
  Visualizer,
  label = "Live waveform",
}: {
  Visualizer: ComponentType<AudioVisualizerProps>;
  label?: string;
}) {
  const [active, setActive] = useState(true);
  const levels = useDemoAudioLevels("history", active);

  return (
    <div className="flex w-full max-w-md flex-col gap-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <Text size="caption" tone="muted">
          {active ? label : "Ready to listen"}
        </Text>
        <Button variant="surface" size="sm" onClick={() => setActive((previous) => !previous)}>
          {active ? "Pause" : "Listen"}
        </Button>
      </div>
      <Visualizer levels={levels} points={48} active={active} aria-label="Voice waveform" className="h-16 w-full" />
      <Visualizer levels={[]} points={48} active={false} aria-label="Idle waveform" className="h-8 w-full" />
    </div>
  );
}
