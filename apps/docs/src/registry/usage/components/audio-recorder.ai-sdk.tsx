"use client";

import { useChat } from "@ai-sdk/react";

import { AudioRecorder, type AudioRecording } from "@/components/control-ui/audio-recorder";

export function Example() {
  const { sendMessage } = useChat();

  async function handleRecordingComplete(recording: AudioRecording) {
    const extension = recording.mimeType.includes("mp4") ? "m4a" : "webm";
    const voiceNote = new File([recording.blob], `voice-note.${extension}`, { type: recording.mimeType });
    const files = new DataTransfer();
    files.items.add(voiceNote);
    await sendMessage({ files: files.files });
  }

  return <AudioRecorder onRecordingComplete={handleRecordingComplete} />;
}
