import { describe, expect, test } from "bun:test";
import { cn } from "@/components/control-ui/lib/cn";
import type { ControlUiSkin } from "@/components/control-ui/skin";
import { SELECTION_INDICATOR_BG_RESET } from "@/components/control-ui/skin";
import { skin as cuicui } from "../../skin-packs/cuicui/skin.config";
import { skin as flat } from "../../skin-packs/flat/skin.config";
import { skin as linear } from "../../skin-packs/linear/skin.config";
import { skin as liquidMetal } from "../../skin-packs/liquid-metal/skin.config";
import { skin as modernApple } from "../../skin-packs/modern-apple/skin.config";
import { skin as refined } from "../../skin-packs/refined/skin.config";
import { skin as rig } from "../../skin-packs/rig/skin.config";
import { skin as xp } from "../../skin-packs/xp/skin.config";

/*
 * tailwind-merge only evicts exact modifier chains SELECTION_INDICATOR_BG_RESET restates, so pack painting row
 * background under any other modifier silently re-adds it at runtime and doubles pill.
 */

const PACKS: ReadonlyArray<readonly [string, ControlUiSkin]> = [
  ["cuicui", cuicui],
  ["flat", flat],
  ["linear", linear],
  ["liquid-metal", liquidMetal],
  ["modern-apple", modernApple],
  ["refined", refined],
  ["rig", rig],
  ["xp", xp],
];

// images count too — gradient doubles pill as colour does
function residualBackgrounds(slotClasses: string | undefined): string[] {
  if (!slotClasses) return [];
  return cn(slotClasses, SELECTION_INDICATOR_BG_RESET)
    .split(/\s+/)
    .filter((token) => /(?:^|:)bg-(?!transparent$)/.test(token));
}

describe("sliding indicator neutralization", () => {
  for (const [id, pack] of PACKS) {
    test(`${id}: sidebar-menu-button backgrounds are fully evicted under indicator="slide"`, () => {
      const entry = pack.slots?.sidebar?.["menu-button"];
      for (const active of [true, false]) {
        const classes = typeof entry === "function" ? entry({ active, indicator: "slide" }) : entry;
        expect(residualBackgrounds(classes)).toEqual([]);
      }
    });

    test(`${id}: tree-item-trigger backgrounds are fully evicted under indicator="slide"`, () => {
      const entry = pack.slots?.tree?.["item-trigger"];
      for (const selected of [true, false]) {
        const classes = typeof entry === "function" ? entry({ selected, expanded: false, disabled: false, indicator: "slide" }) : entry;
        expect(residualBackgrounds(classes)).toEqual([]);
      }
    });
  }
});
