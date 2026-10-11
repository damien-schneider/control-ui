"use client";

import type { SkinMetaId } from "@/app/(features)/model/types";
import { Toggle, ToggleGroup } from "@/components/control-ui/ui/toggle";
import { Text } from "@/components/control-ui/ui/typography";
import { resetConversation } from "@/components/theme-drawer/generation-store";
import { SKIN_META_BY_ID } from "@/components/theme-drawer/presets";
import { SkinLogo } from "@/components/theme-drawer/skin-logo";
import { useThemeRuntime } from "@/components/theme-drawer/theme-runtime-context";
import { tryoutSkinIds } from "./showcase";

export function SkinPicker() {
  const { t, selectSkin } = useThemeRuntime();

  function applySkin([skin]: SkinMetaId[]) {
    if (!skin) return;
    selectSkin(skin);
    resetConversation();
  }

  return (
    <div className="flex min-w-0 items-center gap-3">
      <Text size="label" tone="muted" className="shrink-0">
        Skin
      </Text>
      <ToggleGroup
        value={[t.skin]}
        onValueChange={applySkin}
        aria-label="Skin for this site"
        className="-my-1 min-w-0 flex-nowrap overflow-x-auto py-1"
      >
        {tryoutSkinIds.map((id) => (
          <Toggle key={id} value={id} className="shrink-0">
            <SkinLogo id={id} size="sm" />
            {SKIN_META_BY_ID[id].label}
          </Toggle>
        ))}
      </ToggleGroup>
    </div>
  );
}
