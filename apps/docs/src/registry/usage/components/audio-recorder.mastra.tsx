"use client";

import { useChat, useMastraClient } from "@mastra/react";

import { AudioRecorder, type AudioRecording } from "@/components/control-ui/audio-recorder";

export function Example({ agentId }: { agentId: string }) {
  const client = useMastraClient();
  const { sendMessage } = useChat({ agentId });

  async function handleRecordingComplete(recording: AudioRecording) {
    const { text } = await client.getAgent(agentId).voice.listen(recording.blob);
    await sendMessage({ message: text });
  }

  return <AudioRecorder onRecordingComplete={handleRecordingComplete} />;
}
