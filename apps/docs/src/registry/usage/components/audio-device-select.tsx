"use client";

import { useState } from "react";
import { AudioDeviceSelect } from "@/components/control-ui/audio-device-select";
import { AudioRecorder } from "@/components/control-ui/audio-recorder";
import { useAudioInputDevices } from "@/components/control-ui/hooks/use-audio-recorder";

export function Example() {
  const [deviceId, setDeviceId] = useState<string>();
  const { devices, loading, permission, error, requestPermission } = useAudioInputDevices();

  return (
    <div className="grid gap-4">
      <AudioDeviceSelect
        devices={devices}
        value={deviceId}
        onValueChange={setDeviceId}
        loading={loading}
        permission={permission}
        error={error?.message}
        onRequestPermission={requestPermission}
      />
      <AudioRecorder deviceId={deviceId} />
    </div>
  );
}
