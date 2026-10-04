"use client";

import {
  AudioRecorder,
  AudioRecorderCancel,
  AudioRecorderDuration,
  AudioRecorderStatus,
  AudioRecorderSubmit,
  AudioRecorderTrigger,
  useAudioRecorderContext,
} from "@/components/control-ui/audio-recorder";
import { AudioVisualizer } from "@/components/control-ui/audio-visualizer-line";

// For a project-wide choice, change the visualizer import in your installed audio-recorder.tsx.
function LineWaveform() {
  const recorder = useAudioRecorderContext();
  const isVisible = recorder.state === "recording" || recorder.state === "recorded";

  return (
    <AudioVisualizer
      data-control-ui="audio-recorder"
      data-slot="visualizer"
      data-visible={isVisible ? "true" : undefined}
      data-active={recorder.state === "recording" ? "true" : undefined}
      levels={recorder.levels}
      aria-hidden={!isVisible}
      className="invisible col-start-1 row-start-1 w-full translate-x-1 opacity-0 blur-xs transition-[opacity,filter,translate,visibility] transition-discrete duration-[var(--duration-base)] ease-[var(--ease-emphasized)] data-[visible=true]:visible data-[visible=true]:translate-x-0 data-[visible=true]:opacity-100 data-[visible=true]:blur-none"
    />
  );
}

export function AudioRecorderLineExample() {
  return (
    <div className="flex w-full max-w-md items-center">
      <AudioRecorder maxDurationMs={30_000}>
        <AudioRecorderTrigger />
        <div className="grid min-w-0 flex-1 items-center overflow-hidden">
          <AudioRecorderStatus className="col-start-1 row-start-1 w-full flex-none" />
          <LineWaveform />
        </div>
        <AudioRecorderDuration />
        <div className="flex shrink-0 items-center gap-1">
          <AudioRecorderCancel />
          <AudioRecorderSubmit />
        </div>
      </AudioRecorder>
    </div>
  );
}
