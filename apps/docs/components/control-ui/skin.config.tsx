import type { ControlUiSkin } from "./skin";

/*
 * Docs-owned skin config (the registry default is a static `export const skin = { id: "refined" }`).
 *
 * User-owned surface: installing a skin pack replaces it, and the fixture sync never claws it back.
 * The docs app customizes it the way any consumer could — with GETTERS. Components read `skin` at
 * render time through skin.ts, so a getter-based config makes the ACTIVE skin swappable at runtime:
 * the theme editor calls setSkin(pack config) and remounts the tree so every slot + adornment
 * re-resolves, re-skinning the whole site. A real app's static object keeps zero indirection and
 * full SSR/RSC compatibility. This file NEVER carries "use client" — an advanced pack's interactive
 * adornments live in a separate "use client" component the pack references from its own config.
 */

const refined: ControlUiSkin = { id: "refined" };

let current = refined;

export const skin: ControlUiSkin = {
  get id() {
    return current.id;
  },
  get motion() {
    return current.motion;
  },
  get colorScheme() {
    return current.colorScheme;
  },
  get sidebarLayout() {
    return current.sidebarLayout;
  },
  get indicators() {
    return current.indicators;
  },
  get sidebarWidth() {
    return current.sidebarWidth;
  },
  get slots() {
    return current.slots;
  },
  get paints() {
    return current.paints;
  },
  get adornments() {
    return current.adornments;
  },
  get effects() {
    return current.effects;
  },
};

/** Docs-only: swap the active skin, then remount the subtree so every slot + adornment re-resolves. */
export function setSkin(next: ControlUiSkin) {
  current = next;
}
