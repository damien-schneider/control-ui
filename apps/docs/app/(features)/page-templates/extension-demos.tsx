"use client";

import { useId, useState } from "react";
import { ComponentPreview } from "@/app/(features)/components/previews";
import type { ExtensionId } from "@/app/(features)/model/types";
import { ControlEffectsRoot } from "@/components/control-ui/extensions/control-effects-root";
import type { ControlEffect } from "@/components/control-ui/skin";
import { Card, CardContent } from "@/components/control-ui/ui/card";
import { Toggle, ToggleGroup } from "@/components/control-ui/ui/toggle";
import { Text } from "@/components/control-ui/ui/typography";
import { controlEffectsDemoComponentId } from "./extension-demo-ids";

export function ExtensionDemo({ extensionId }: { extensionId: ExtensionId }) {
  if (extensionId === "control-effects") return <ControlEffectsDemo />;
  return null;
}

const controlEffectPresets = [
  { id: "top-shine", label: "Top shine" },
  { id: "ripple", label: "Click ripple" },
  { id: "hover-circle", label: "Hover circle" },
] as const satisfies readonly { id: ControlEffect; label: string }[];

// Scoped ControlEffectsRoot override wrapping sample controls — toggles stay outside root so the
// demo chrome never wears effects it switches.
function ControlEffectsDemo() {
  const [effects, setEffects] = useState<ControlEffect[]>(["top-shine", "ripple", "hover-circle"]);
  const labelId = useId();

  return (
    <div className="grid min-w-0 gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <Text id={labelId} size="caption" weight="medium" tone="muted">
          Effects
        </Text>
        <ToggleGroup multiple value={effects} onValueChange={setEffects} aria-labelledby={labelId} className="flex-wrap">
          {controlEffectPresets.map((preset) => (
            <Toggle key={preset.id} value={preset.id} size="xs">
              {preset.label}
            </Toggle>
          ))}
        </ToggleGroup>
      </div>
      <ControlEffectsRoot effects={effects}>
        <Card size="sm">
          <CardContent className="flex justify-center">
            <ComponentPreview componentId={controlEffectsDemoComponentId} />
          </CardContent>
        </Card>
      </ControlEffectsRoot>
    </div>
  );
}
