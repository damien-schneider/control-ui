"use client";

import type { SkinMetaId } from "@/app/(features)/model/types";
import type { ControlUiSkin } from "@/components/control-ui/skin";
import { skin as cuicuiPack } from "@/src/registry/skin-packs/cuicui/skin.config";
import { skin as flatPack } from "@/src/registry/skin-packs/flat/skin.config";
import { skin as linearPack } from "@/src/registry/skin-packs/linear/skin.config";
import { skin as liquidMetalPack } from "@/src/registry/skin-packs/liquid-metal/skin.config";
import { skin as modernApplePack } from "@/src/registry/skin-packs/modern-apple/skin.config";
import { skin as refinedPack } from "@/src/registry/skin-packs/refined/skin.config";
import { skin as rigPack } from "@/src/registry/skin-packs/rig/skin.config";
import { skin as windows98Pack } from "@/src/registry/skin-packs/windows-98/skin.config";
import { skin as xpPack } from "@/src/registry/skin-packs/xp/skin.config";

export const SKIN_CONFIGS: Record<SkinMetaId, ControlUiSkin> = {
  refined: refinedPack,
  xp: xpPack,
  "windows-98": windows98Pack,
  "liquid-metal": liquidMetalPack,
  rig: rigPack,
  flat: flatPack,
  "modern-apple": modernApplePack,
  cuicui: cuicuiPack,
  linear: linearPack,
};
