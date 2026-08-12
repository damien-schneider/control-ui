"use client";

import { ToolbarButton } from "@/components/control-ui/ui/toolbar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/control-ui/ui/tooltip";
import { ALL_SKIN_IDS, SKIN_META_BY_ID } from "./presets";
import { SkinLogo } from "./skin-logo";
import { useThemeRuntime } from "./theme-runtime-context";

export function SkinPresetControls() {
  const { t, selectSkin } = useThemeRuntime();

  return (
    <fieldset aria-label="Skin presets" className="contents">
      {ALL_SKIN_IDS.map((id) => {
        const selected = t.customThemeId === null && t.skin === id;
        const label = SKIN_META_BY_ID[id].label;

        return (
          <Tooltip key={id}>
            <TooltipTrigger
              render={
                <ToolbarButton
                  iconOnly={!selected}
                  data-active={selected ? "true" : undefined}
                  aria-pressed={selected}
                  aria-label={label}
                  onClick={() => selectSkin(id)}
                  className="gap-1.5"
                />
              }
            >
              <SkinLogo id={id} size="sm" />
              {selected ? <span className="max-sm:sr-only">{label}</span> : null}
            </TooltipTrigger>
            <TooltipContent side="bottom">{label}</TooltipContent>
          </Tooltip>
        );
      })}
    </fieldset>
  );
}
