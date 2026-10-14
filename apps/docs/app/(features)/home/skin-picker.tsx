"use client";

import type { SkinMetaId } from "@/app/(features)/model/types";
import { Toolbar, ToolbarButton, ToolbarGroup } from "@/components/control-ui/ui/toolbar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/control-ui/ui/tooltip";
import { Text } from "@/components/control-ui/ui/typography";
import { resetConversation } from "@/components/theme-drawer/generation-store";
import { SKIN_META_BY_ID } from "@/components/theme-drawer/presets";
import { SkinLogo } from "@/components/theme-drawer/skin-logo";
import { useThemeRuntime } from "@/components/theme-drawer/theme-runtime-context";
import { tryoutSkinIds } from "./showcase";

export function SkinPicker() {
  const { t, selectSkin } = useThemeRuntime();

  function applySkin(skin: SkinMetaId) {
    selectSkin(skin);
    resetConversation();
  }

  return (
    <TooltipProvider>
      <Toolbar
        variant="floating"
        aria-label="Skin"
        className="fixed top-[calc(100svh-4.25rem-env(safe-area-inset-bottom))] left-[max(1rem,calc(50%-8rem))] z-40 max-w-[calc(100%-2rem)]"
      >
        <Text size="label" tone="muted" className="shrink-0 ps-2 pe-1">
          Skin
        </Text>
        <ToolbarGroup aria-label="Skin for this site">
          {tryoutSkinIds.map((id) => {
            const pressed = t.skin === id;
            return (
              <Tooltip key={id}>
                <TooltipTrigger
                  render={
                    <ToolbarButton
                      iconOnly
                      aria-label={SKIN_META_BY_ID[id].label}
                      aria-pressed={pressed}
                      data-pressed={pressed ? "" : undefined}
                      onClick={() => applySkin(id)}
                    />
                  }
                >
                  <SkinLogo id={id} size="sm" />
                </TooltipTrigger>
                <TooltipContent>{SKIN_META_BY_ID[id].label}</TooltipContent>
              </Tooltip>
            );
          })}
        </ToolbarGroup>
      </Toolbar>
    </TooltipProvider>
  );
}
