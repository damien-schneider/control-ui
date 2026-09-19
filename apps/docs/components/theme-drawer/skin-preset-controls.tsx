"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/control-ui/ui/select";
import { ALL_SKIN_IDS, isSkinId, SKIN_META_BY_ID } from "./presets";
import { SkinLogo } from "./skin-logo";
import { useThemeRuntime } from "./theme-runtime-context";

export function SkinPresetControls({ className }: { className?: string }) {
  const { t, selectSkin } = useThemeRuntime();
  const value = t.customThemeId === null ? t.skin : "";

  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (isSkinId(next)) selectSkin(next);
      }}
    >
      <SelectTrigger aria-label="Skin" className={className}>
        <SelectValue placeholder="Skin">
          {(selected) =>
            isSkinId(selected) ? (
              <span className="flex min-w-0 items-center gap-1.5">
                <SkinLogo id={selected} size="sm" />
                <span className="truncate">{SKIN_META_BY_ID[selected].label}</span>
              </span>
            ) : null
          }
        </SelectValue>
      </SelectTrigger>
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
