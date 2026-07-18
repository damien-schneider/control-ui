"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { Slider } from "@/components/control-ui/ui/slider";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

export function PrimitiveSliderExample() {
  const [value, setValue] = useState(40);
  const [plainValue, setPlainValue] = useState(65);
  const [zoom, setZoom] = useState(50);

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Row label="Default">
        <Slider aria-label="Default slider" value={value} onValueChange={setValue} min={0} max={100} />
      </Row>
      <Row label="Plain">
        <Slider variant="plain" aria-label="Plain slider" value={plainValue} onValueChange={setPlainValue} min={0} max={100} />
      </Row>
      <Row label="Plain, labeled">
        <Slider
          variant="plain"
          label="Zoom"
          value={zoom}
          onValueChange={setZoom}
          min={0}
          max={100}
          step={10}
          formatValue={(v) => `${v}%`}
        />
      </Row>
      <Row label="Disabled">
        <Slider variant="plain" aria-label="Disabled slider" value={30} disabled min={0} max={100} />
      </Row>
    </div>
  );
}
