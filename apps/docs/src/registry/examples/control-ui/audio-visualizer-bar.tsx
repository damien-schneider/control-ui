"use client";

import { AudioVisualizer } from "@/components/control-ui/audio-visualizer-bar";
import { useDemoAudioLevels } from "@/src/registry/examples/control-ui/audio-visualizer-demo";

const alignments = ["center", "start", "end"] as const;
const idleModes = ["static", "pulse", "wave"] as const;

export function AudioVisualizerBarExample() {
  const levels = useDemoAudioLevels("bands");

  return (
    <div className="grid w-full max-w-lg gap-6 py-4">
      <div className="grid grid-cols-3 gap-4">
        {alignments.map((align) => (
          <div key={align} className="grid gap-2 text-center">
            <AudioVisualizer
              levels={levels}
              points={16}
              align={align}
              aria-label={`${align} aligned frequency bars`}
              className="h-16 w-full"
            />
            <span className="text-caption text-muted-foreground">{align}</span>
          </div>
        ))}
      </div>
      <AudioVisualizer levels={levels} points={32} mirrored aria-label="Mirrored frequency bars" className="h-16 w-full" />
      <div className="grid grid-cols-4 gap-3">
        {idleModes.map((idle) => (
          <div key={idle} className="grid gap-2 text-center">
            <AudioVisualizer levels={[]} points={8} active={false} idle={idle} aria-label={`Idle ${idle} bars`} className="h-8 w-full" />
            <span className="text-caption text-muted-foreground">{idle}</span>
          </div>
        ))}
        <div className="grid gap-2 text-center">
          <AudioVisualizer levels={[]} points={8} loading aria-label="Connecting audio" className="h-8 w-full" />
          <span className="text-caption text-muted-foreground">loading</span>
        </div>
      </div>
    </div>
  );
}
