"use client";

import { AudioVisualizer } from "@/components/control-ui/audio-visualizer";
import { AudioVisualizerDemo } from "@/src/registry/examples/control-ui/audio-visualizer-demo";

export function AudioVisualizerExample() {
  return <AudioVisualizerDemo Visualizer={AudioVisualizer} />;
}
