"use client";

import { useEffect, useState } from "react";
import { AudioVisualizer } from "@/components/control-ui/audio-visualizer-bar";

export function Example({ analyser, active = true }: { analyser: AnalyserNode | null; active?: boolean }) {
  const [levels, setLevels] = useState<number[]>([]);

  useEffect(() => {
    if (!analyser || !active) return;
    const bands = new Uint8Array(analyser.frequencyBinCount);
    const timer = setInterval(() => {
      analyser.getByteFrequencyData(bands);
      setLevels(Array.from(bands, (value) => value / 255));
    }, 80);
    return () => clearInterval(timer);
  }, [analyser, active]);

  return (
    <AudioVisualizer
      levels={levels}
      points={24}
      active={active && analyser !== null}
      align="end"
      aria-label="Audio frequency bands"
      className="h-16 w-full"
    />
  );
}
