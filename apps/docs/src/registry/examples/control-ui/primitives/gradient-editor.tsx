"use client";

import { useState } from "react";

import {
  GradientEditor,
  GradientEditorPreview,
  GradientEditorStopAdd,
  GradientEditorStopColor,
  GradientEditorTrack,
  GradientEditorTypeSelect,
} from "@/components/control-ui/ui/gradient-editor";
import { Text } from "@/components/control-ui/ui/typography";

export function PrimitiveGradientEditorExample() {
  const [gradient, setGradient] = useState("");

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <GradientEditor
        onValueChange={setGradient}
        defaultStops={[
          { id: "stop-1", position: 0, color: "#7c3aed" },
          { id: "stop-2", position: 1, color: "#3b82f6" },
        ]}
      >
        <GradientEditorPreview />
        <GradientEditorTrack />
        <div className="flex items-center gap-2">
          <GradientEditorStopColor />
          <GradientEditorTypeSelect className="flex-1" />
          <GradientEditorStopAdd />
        </div>
      </GradientEditor>
      <Text as="code" size="micro" tone="muted" className="truncate rounded-[var(--radius-sm)] bg-foreground/4 px-2 py-1 font-mono">
        {gradient}
      </Text>
    </div>
  );
}
