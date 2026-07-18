"use client";

import { Meter, MeterIndicator, MeterLabel, MeterTrack, MeterValue } from "@/components/control-ui/ui/meter";

export function PrimitiveMeterExample() {
  return (
    <Meter value={6.2} max={8} className="max-w-xs">
      <div className="flex items-center justify-between">
        <MeterLabel>Storage used</MeterLabel>
        <MeterValue>{(_formatted, current) => `${current} GB of 8 GB`}</MeterValue>
      </div>
      <MeterTrack>
        <MeterIndicator />
      </MeterTrack>
    </Meter>
  );
}
