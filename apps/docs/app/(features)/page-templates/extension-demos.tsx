"use client";

import { useState } from "react";
import { PrimitivePreview } from "@/app/(features)/components/previews";
import type { ExtensionId } from "@/app/(features)/model/types";
import type { ControlEffect } from "@/components/control-ui/extensions/control-effects";
import { ControlEffectsRoot } from "@/components/control-ui/extensions/control-effects-root";
import { Button } from "@/components/control-ui/ui/button";

export function ExtensionDemo({ extensionId }: { extensionId: ExtensionId }) {
  if (extensionId === "control-effects") return <ControlEffectsDemo />;
  return null;
}

const controlEffectPresets = [
  { id: "top-shine", label: "Top shine" },
  { id: "ripple", label: "Click ripple" },
  { id: "hover-circle", label: "Hover circle" },
] as const satisfies readonly { id: ControlEffect; label: string }[];

// Scoped ControlEffectsRoot override wrapping sample controls — the toggles stay outside the root so the
// demo chrome never wears the effects it switches.
function ControlEffectsDemo() {
  const [effects, setEffects] = useState<ControlEffect[]>(["top-shine", "ripple", "hover-circle"]);

  function toggleEffect(effect: ControlEffect) {
    setEffects((current) => (current.includes(effect) ? current.filter((item) => item !== effect) : [...current, effect]));
  }

  return (
    <div className="grid min-w-0 gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-caption font-medium text-muted-foreground">Effects</span>
        {controlEffectPresets.map((preset) => {
          const active = effects.includes(preset.id);

          return (
            <Button
              key={preset.id}
              type="button"
              variant={active ? "surface" : "quiet"}
              size="xs"
              active={active}
              aria-pressed={active}
              onClick={() => toggleEffect(preset.id)}
            >
              {preset.label}
            </Button>
          );
        })}
      </div>
      <ControlEffectsRoot effects={effects}>
        <div className="flex w-full justify-center rounded-lg border border-border/70 bg-background px-4 py-6">
          <PrimitivePreview primitiveId="button" />
        </div>
      </ControlEffectsRoot>
    </div>
  );
}
