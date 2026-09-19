"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/control-ui/ui/select";
import { ToolbarButton } from "@/components/control-ui/ui/toolbar";
import { ALL_SKIN_IDS, isSkinId, SKIN_META_BY_ID } from "./presets";
import { SkinLogo } from "./skin-logo";
import { useThemeRuntime } from "./theme-runtime-context";

export function SkinPresetControls() {
  const { t, selectSkin } = useThemeRuntime();
  const value = t.customThemeId === null ? t.skin : "";

  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (isSkinId(next)) selectSkin(next);
      }}
    >
      <ToolbarButton aria-label="Skin" render={<SelectTrigger variant="ghost" />}>
        <SelectValue placeholder="Skin">
          {(selected) =>
            isSkinId(selected) ? (
              <span className="flex min-w-0 items-center gap-1.5">
                <SkinLogo id={selected} size="sm" />
                <span className="truncate max-sm:sr-only">{SKIN_META_BY_ID[selected].label}</span>
              </span>
            ) : null
          }
        </SelectValue>
      </ToolbarButton>
      <SelectContent>
        {ALL_SKIN_IDS.map((id) => (
          <SelectItem key={id} value={id} label={SKIN_META_BY_ID[id].label}>
            <SkinLogo id={id} size="sm" />
            {SKIN_META_BY_ID[id].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
