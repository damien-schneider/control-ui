"use client";

import { useState } from "react";

import { NativeSelect } from "@/components/control-ui/ui/native-select";

export function PrimitiveNativeSelectExample() {
  const [model, setModel] = useState("sonnet");

  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <label htmlFor="ns-model" className="text-[11px] font-medium text-muted-foreground">
        Default model
      </label>
      <NativeSelect id="ns-model" size="sm" value={model} onChange={(event) => setModel(event.target.value)}>
        <option value="sonnet">Claude Sonnet</option>
        <option value="opus">Claude Opus</option>
        <option value="haiku">Claude Haiku</option>
      </NativeSelect>
    </div>
  );
}
