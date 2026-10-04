"use client";

import { useState } from "react";
import type { AudioDevice } from "@/components/control-ui/audio-device-select";
import {
  AudioDeviceSelect,
  AudioDeviceSelectContent,
  AudioDeviceSelectPreview,
  AudioDeviceSelectStatus,
  AudioDeviceSelectTrigger,
} from "@/components/control-ui/audio-device-select";
import { AudioVisualizer } from "@/components/control-ui/audio-visualizer";
import { Button } from "@/components/control-ui/ui/button";
import { useDemoAudioLevels } from "@/src/registry/examples/control-ui/audio-visualizer-demo";

const devices: AudioDevice[] = [
  { deviceId: "default", label: "System microphone", isDefault: true },
  { deviceId: "studio", label: "Shure MV7+" },
  { deviceId: "headset", label: "Headset microphone" },
  { deviceId: "camera", label: "Camera microphone", status: "unavailable" },
];

export function AudioDeviceSelectExample() {
  const [value, setValue] = useState("studio");
  const [disconnected, setDisconnected] = useState(false);
  const active = value !== "" && !(disconnected && value === "studio");
  const levels = useDemoAudioLevels("history", active);

  return (
    <div className="grid w-full max-w-sm gap-4 py-4">
      <AudioDeviceSelect
        devices={disconnected ? devices.filter((device) => device.deviceId !== "studio") : devices}
        value={value}
        onValueChange={setValue}
        allowNone
      >
        <AudioDeviceSelectTrigger />
        <AudioDeviceSelectContent />
        <AudioDeviceSelectPreview>
          <AudioVisualizer levels={levels} active={active} points={48} aria-label="Microphone preview" className="h-12 w-full" />
        </AudioDeviceSelectPreview>
        <AudioDeviceSelectStatus />
      </AudioDeviceSelect>
      <Button variant="surface" size="sm" onClick={() => setDisconnected((previous) => !previous)}>
        {disconnected ? "Reconnect microphone" : "Disconnect microphone"}
      </Button>
    </div>
  );
}

export function AudioDeviceSelectStatesExample() {
  return (
    <div className="grid w-full max-w-lg gap-4 sm:grid-cols-2">
      <AudioDeviceSelect devices={devices} defaultValue="default" label="Default input" />
      <AudioDeviceSelect devices={devices} defaultValue="" allowNone label="Optional input" />
      <AudioDeviceSelect devices={[]} value="unplugged" label="Disconnected input" />
      <AudioDeviceSelect devices={[]} loading label="Loading input" />
      <AudioDeviceSelect devices={[]} permission="prompt" label="Permission required input" />
      <AudioDeviceSelect devices={[]} permission="denied" label="Blocked input" />
    </div>
  );
}
