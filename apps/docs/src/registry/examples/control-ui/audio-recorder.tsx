"use client";

import { useState } from "react";

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
import { Button } from "@/components/control-ui/ui/button";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/control-ui/ui/combobox";

type MicrophoneOption = {
  value: string;
  label: string;
};

const SYSTEM_DEFAULT: MicrophoneOption = { value: "", label: "System default" };

export function AudioRecorderExample() {
  const [recording, setRecording] = useState<AudioRecording | null>(null);
  const [deviceId, setDeviceId] = useState("");
  const { devices, hasPermission, requestPermission } = useAudioInputDevices();

  // Device selection lives in app, not recorder: Combobox wired to useAudioInputDevices, chosen id
  // handed to <AudioRecorder deviceId>. Swap for any list UI.
  const options: MicrophoneOption[] = [
    SYSTEM_DEFAULT,
    ...devices.map((device, index) => ({
      value: device.deviceId,
      label: formatAudioInputDeviceLabel(device, `Microphone ${index + 1}`),
    })),
  ];
  const selected = options.find((option) => option.value === deviceId) ?? SYSTEM_DEFAULT;

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-44 flex-1">
          <Combobox items={options} value={selected} onValueChange={(option: MicrophoneOption | null) => setDeviceId(option?.value ?? "")}>
            <ComboboxInput placeholder="Search microphones…" aria-label="Microphone" />
            <ComboboxContent>
              <ComboboxEmpty>No microphones found.</ComboboxEmpty>
              <ComboboxList>
                {(option: MicrophoneOption) => (
                  <ComboboxItem key={option.value || "system-default"} value={option}>
                    {option.label}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
        {hasPermission ? null : (
          <Button className="shrink-0" variant="surface" tone="neutral" size="sm" onClick={() => void requestPermission()}>
            Allow access
          </Button>
        )}
      </div>

      <AudioRecorder deviceId={deviceId || undefined} onRecordingComplete={setRecording} maxDurationMs={30_000}>
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
        <div className="translate-x-0 rounded-field border border-border/70 bg-card px-3 py-2 text-meta text-muted-foreground opacity-100 blur-none shadow-sm transition-[opacity,filter,translate] duration-[var(--duration-base)] ease-[var(--ease-emphasized)] starting:translate-x-1 starting:opacity-0 starting:blur-xs">
          Voice attachment / {formatAudioRecorderDuration(recording.durationMs)} / {recording.mimeType}
        </div>
      ) : null}
    </div>
  );
}
