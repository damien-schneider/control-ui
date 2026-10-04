"use client";

import { AudioVisualizer } from "@/components/control-ui/audio-visualizer-line";
import { AudioVisualizerDemo } from "@/src/registry/examples/control-ui/audio-visualizer-demo";

export function AudioVisualizerLineExample() {
  return <AudioVisualizerDemo Visualizer={AudioVisualizer} label="Line envelope" />;
}
