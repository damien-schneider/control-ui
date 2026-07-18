"use client";

import { useEffect, useState } from "react";

import { AudioVisualizer } from "@/components/control-ui/audio-visualizer";

const windowSize = 48;
const sampleInterval = 80;

function useElementLevels(audio: HTMLAudioElement | null) {
  const [levels, setLevels] = useState<number[]>(() => Array.from({ length: windowSize }, () => 0));

  useEffect(() => {
    if (!audio) return;

    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = 1024;
    const sourceNode = context.createMediaElementSource(audio);
    sourceNode.connect(analyser);
    analyser.connect(context.destination);
    const samples = new Uint8Array(analyser.fftSize);

    const timer = setInterval(() => {
      analyser.getByteTimeDomainData(samples);
      let sum = 0;
      for (const sample of samples) {
        const centered = (sample - 128) / 128;
        sum += centered * centered;
      }
      const rootMeanSquare = Math.sqrt(sum / samples.length);
      setLevels((previous) => [...previous.slice(1), Math.min(1, rootMeanSquare * 4)]);
    }, sampleInterval);

    return () => {
      clearInterval(timer);
      sourceNode.disconnect();
      void context.close();
    };
  }, [audio]);

  return levels;
}

export function Example({ audio }: { audio: HTMLAudioElement | null }) {
  const levels = useElementLevels(audio);

  return <AudioVisualizer levels={levels} />;
}
