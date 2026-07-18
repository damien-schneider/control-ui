"use client";

import { useEffect, useState } from "react";

import { AudioVisualizer } from "@/components/control-ui/audio-visualizer";

// Synthetic speech-like level stream: layered sines with a slow envelope, so the preview animates
// deterministically without microphone permission. In an app the window comes from real audio —
// see the usage tab for the AnalyserNode mapping.
const WINDOW_SIZE = 48;
const TICK_MS = 80;

function syntheticLevel(frame: number) {
  const envelope = 0.55 + 0.45 * Math.sin(frame / 9.3);
  const detail = 0.5 + 0.28 * Math.sin(frame / 2.1) + 0.18 * Math.sin(frame / 0.9);
  return Math.min(1, Math.max(0.04, envelope * detail));
}

function useSyntheticLevels() {
  const [levels, setLevels] = useState<number[]>(() => Array.from({ length: WINDOW_SIZE }, (_, index) => syntheticLevel(index)));

  useEffect(() => {
    let frame = WINDOW_SIZE;
    const timer = setInterval(() => {
      frame += 1;
      setLevels((previous) => [...previous.slice(1), syntheticLevel(frame)]);
    }, TICK_MS);
    return () => clearInterval(timer);
  }, []);

  return levels;
}

export function AudioVisualizerExample() {
  const levels = useSyntheticLevels();

  return (
    <div className="flex w-full items-center justify-center py-6">
      <AudioVisualizer levels={levels} />
    </div>
  );
}
