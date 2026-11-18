import { describe, expect, test } from "bun:test";
import { skinMetas } from "@/app/(features)/catalog/skins";
import { SKIN_CONFIGS } from "@/components/skin-registry";
import { MODE_LOCKED_SKINS, MOTION_REDUCED_SKINS, PAGE_LAYOUT_SKINS, type Theme } from "@/components/theme";

/*
 * Guard: MODE_LOCKED_SKINS/MOTION_REDUCED_SKINS/PAGE_LAYOUT_SKINS (theme.ts) mirror colorScheme/motion/sidebarLayout on each skin.config.
 * Live in theme.ts, apart from skin-registry, so pre-paint init script can honor them without pulling React/skin-config graph.
 * Tests derive truth from actual configs, fail on drift — forces teaching init script when adding a dark-only/motion-reduced skin.
 */

describe("mode-locked skins stay in sync with the skin.config contract", () => {
  // Narrowing inside the guard drops `undefined` from colorScheme, so each assigned value is a Theme.
  const fromConfigs: Record<string, Theme> = {};
  for (const [id, config] of Object.entries(SKIN_CONFIGS)) {
    if (config.colorScheme !== undefined) fromConfigs[id] = config.colorScheme;
  }

  test("MODE_LOCKED_SKINS equals the set of skin.config colorScheme fields", () => {
    expect(MODE_LOCKED_SKINS).toEqual(fromConfigs);
  });
});

test("pre-paint skin ids stay in sync with the skin registry", () => {
  // build-theme-init inlines the catalog's skin ids into the pre-paint script, so the catalog must name every registered skin.
  // Both sides read as plain ids: the registry keys are strings, and the comparison is about the sets, not the union.
  const initSkinIds: string[] = skinMetas.map((skin) => skin.id);
  expect(initSkinIds.sort()).toEqual(Object.keys(SKIN_CONFIGS).sort());
});

describe("motion-reduced skins stay in sync with the skin.config contract", () => {
  const fromConfigs = Object.entries(SKIN_CONFIGS)
    .filter(([, config]) => config.motion === "reduced")
    .map(([id]) => id);

  test("MOTION_REDUCED_SKINS equals the set of skin.config motion:reduced fields", () => {
    expect([...MOTION_REDUCED_SKINS].sort()).toEqual(fromConfigs.sort());
  });
});

describe("page-layout skins stay in sync with the skin.config contract", () => {
  const fromConfigs = Object.entries(SKIN_CONFIGS)
    .filter(([, config]) => config.sidebarLayout === "page")
    .map(([id]) => id);

  test("PAGE_LAYOUT_SKINS equals the set of skin.config sidebarLayout:page fields", () => {
    expect([...PAGE_LAYOUT_SKINS].sort()).toEqual(fromConfigs.sort());
  });
});
