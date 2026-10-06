"use client";

import { useState } from "react";

import { formatGradient } from "@/components/control-ui/lib/gradient";
import {
  GradientEditor,
  GradientEditorAngle,
  GradientEditorInterpolationSelect,
  GradientEditorPreview,
  GradientEditorStopAdd,
  GradientEditorStopColor,
  GradientEditorTrack,
  GradientEditorTypeSelect,
  type GradientValue,
} from "@/components/control-ui/ui/color-picker";
import { Text } from "@/components/control-ui/ui/typography";

const BLUE_TO_YELLOW: GradientValue = {
  type: "linear",
  angle: 90,
  interpolation: "oklab",
  stops: [
    { id: "stop-1", position: 0, color: "#2563eb" },
    { id: "stop-2", position: 1, color: "#facc15" },
  ],
};

export function PrimitiveGradientEditorExample() {
  const [gradient, setGradient] = useState(BLUE_TO_YELLOW);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <GradientEditor value={gradient} onValueChange={setGradient}>
        <GradientEditorPreview />
        <GradientEditorTrack />
        <div className="flex items-center gap-2">
          <GradientEditorStopColor />
          <GradientEditorTypeSelect className="flex-1" />
          <GradientEditorInterpolationSelect className="flex-1" />
          <GradientEditorAngle className="w-18" />
          <GradientEditorStopAdd />
        </div>
      </GradientEditor>
      <Text as="code" size="micro" tone="muted" className="truncate rounded-[var(--radius-sm)] bg-foreground/4 px-2 py-1 font-mono">
        {formatGradient(gradient)}
      </Text>
    </div>
  );
}
