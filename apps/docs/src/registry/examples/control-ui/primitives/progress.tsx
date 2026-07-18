"use client";

import { useEffect, useState } from "react";

import { Progress, ProgressIndicator, ProgressLabel, ProgressTrack, ProgressValue } from "@/components/control-ui/ui/progress";

export function PrimitiveProgressExample() {
  const [value, setValue] = useState(24);

  useEffect(() => {
    const id = setInterval(() => {
      setValue((current) => (current >= 100 ? 0 : Math.min(100, current + 8)));
    }, 900);
    return () => clearInterval(id);
  }, []);

  return (
    <Progress value={value} className="max-w-xs">
      <div className="flex items-center justify-between">
        <ProgressLabel>Indexing registry</ProgressLabel>
        <ProgressValue>{(_formatted, current) => (current == null ? "—" : `${current}%`)}</ProgressValue>
      </div>
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </Progress>
  );
}
