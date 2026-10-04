"use client";

import { useState } from "react";

import { AudioDeviceSelect } from "@/components/control-ui/audio-device-select";
import {
  AudioRecorder,
  AudioRecorderCancel,
  AudioRecorderDuration,
  AudioRecorderStatus,
  AudioRecorderSubmit,
  AudioRecorderTrigger,
  AudioRecorderVisualizer,
  type AudioRecording,
} from "@/components/control-ui/audio-recorder";
import { formatAudioInputDeviceLabel, useAudioInputDevices } from "@/components/control-ui/hooks/use-audio-recorder";
import { formatAudioRecorderDuration } from "@/components/control-ui/lib/format-audio-recorder-duration";
export function AudioRecorderExample() {
  const [recording, setRecording] = useState<AudioRecording | null>(null);
  const [deviceId, setDeviceId] = useState("default");
  const { devices, loading, permission, error, requestPermission } = useAudioInputDevices();
  const options = devices.map((device, index) => ({
    deviceId: device.deviceId,
    label: formatAudioInputDeviceLabel(device, `Microphone ${index + 1}`),
  }));
  const inputs = options.some((device) => device.deviceId === "default")
    ? options
    : [{ deviceId: "default", label: "System default" }, ...options];

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <AudioDeviceSelect
        devices={inputs}
        value={deviceId}
        onValueChange={setDeviceId}
        loading={loading}
        permission={permission}
        error={error?.message}
        onRequestPermission={requestPermission}
      />

      <AudioRecorder deviceId={deviceId === "default" ? undefined : deviceId} onRecordingComplete={setRecording} maxDurationMs={30_000}>
        <AudioRecorderTrigger />
        <div className="grid min-w-0 flex-1 items-center overflow-hidden">
          <AudioRecorderStatus className="col-start-1 row-start-1 w-full flex-none" />
          <AudioRecorderVisualizer className="col-start-1 row-start-1 w-full" />
        </div>
        <AudioRecorderDuration />
        <div className="flex shrink-0 items-center gap-1">
          <AudioRecorderCancel />
          <AudioRecorderSubmit />
        </div>
      </AudioRecorder>

      {recording ? (
        <div className="translate-x-0 rounded-field border border-border/70 bg-card px-3 py-2 text-caption text-muted-foreground opacity-100 blur-none shadow-sm transition-[opacity,filter,translate] duration-[var(--duration-base)] ease-[var(--ease-emphasized)] starting:translate-x-1 starting:opacity-0 starting:blur-xs">
          Voice attachment / {formatAudioRecorderDuration(recording.durationMs)} / {recording.mimeType}
        </div>
      ) : null}
    </div>
  );
}
