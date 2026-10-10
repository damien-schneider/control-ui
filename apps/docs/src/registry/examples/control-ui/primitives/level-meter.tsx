"use client";

import { useId } from "react";
import { LevelMeter, LevelMeterBar, LevelMeterPeak, type LevelMeterSource, LevelMeterTrack } from "@/components/control-ui/ui/level-meter";
import { Text } from "@/components/control-ui/ui/typography";

const speechLikeVoice: LevelMeterSource = {
  subscribe(listener) {
    let frame = 0;
    const emitLevel = (nowMs: number) => {
      const syllable = Math.abs(Math.sin(nowMs / 170)) * Math.abs(Math.sin(nowMs / 1300));
      listener(-50 + syllable * 46 + Math.random() * 4);
      frame = requestAnimationFrame(emitLevel);
    };
    frame = requestAnimationFrame(emitLevel);
    return () => cancelAnimationFrame(frame);
  },
};

export function PrimitiveLevelMeterExample() {
  const labelId = useId();
  return (
    <div className="flex w-full max-w-xs items-end gap-6">
      <div className="flex flex-1 flex-col gap-2">
        <Text id={labelId} size="label" weight="medium">
          Microphone
        </Text>
        <LevelMeter aria-labelledby={labelId} source={speechLikeVoice}>
          <LevelMeterTrack>
            <LevelMeterBar />
            <LevelMeterPeak />
          </LevelMeterTrack>
        </LevelMeter>
      </div>
      <LevelMeter aria-label="Program level" orientation="vertical" source={speechLikeVoice} className="h-24" />
    </div>
  );
}
