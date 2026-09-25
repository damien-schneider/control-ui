"use client";

import { VarTag } from "@/components/theme-drawer/controls";
import { LayerPreview } from "@/components/theme-drawer/layer-previews";
import { contractTokenNames, SpecimenGroup, TokenValueList } from "./specimen/specimen";
import { useContractTokens } from "./specimen/theme-readouts";

function SurfaceStack() {
  return (
    <div className="flex flex-col items-start gap-3 rounded-[var(--radius-scene)] bg-canvas p-4 ring-1 ring-inset ring-border">
      <VarTag>--canvas</VarTag>
      <div className="flex flex-col items-start gap-3 self-stretch rounded-[var(--radius-panel)] bg-background p-4 ring-1 ring-inset ring-border">
        <VarTag>--background</VarTag>
        <div className="flex flex-col items-start gap-3 self-stretch rounded-[var(--radius-panel)] bg-card p-4 text-card-foreground shadow-md">
          <VarTag>--card</VarTag>
          <div className="flex w-full max-w-xs flex-col items-start gap-2 self-end rounded-[var(--radius-popover)] bg-popover p-3 text-popover-foreground shadow-pop backdrop-blur-[var(--backdrop-blur-popover)]">
            <VarTag>--popover</VarTag>
            <span className="text-caption text-muted-foreground">Menus, selects and dialogs float here.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SurfaceFoundations() {
  const tokens = useContractTokens();
  return (
    <div className="grid min-w-0">
      <SpecimenGroup title="Stacking order">
        <SurfaceStack />
      </SpecimenGroup>
      <SpecimenGroup title="Overlays and translucency">
        <LayerPreview values={tokens} />
        <TokenValueList names={contractTokenNames("surface")} />
      </SpecimenGroup>
    </div>
  );
}
