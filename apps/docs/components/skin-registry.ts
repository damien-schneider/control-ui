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
import { skin as xpPack } from "@/src/registry/skin-packs/xp/skin.config";

/*
 * Docs-side registry of skin configs; theme editor swaps active skin globally via setSkin(SKIN_CONFIGS[id]) — same as installing a pack, but at runtime.
 * Advanced packs bring real per-slot classes+adornments; theme/CSS-only skins (+ WebGL liquid-metal) carry just an id, pure tokens/skin.css.
 * Config only needs active id for skinId() and portal re-assertion that keeps popups themed outside token-scoped ancestor.
 */
export const SKIN_CONFIGS: Record<SkinMetaId, ControlUiSkin> = {
  refined: refinedPack,
  xp: xpPack,
  "liquid-metal": liquidMetalPack,
  rig: rigPack,
  flat: flatPack,
  "modern-apple": modernApplePack,
  cuicui: cuicuiPack,
  linear: linearPack,
};
