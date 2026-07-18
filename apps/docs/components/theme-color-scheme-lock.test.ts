import { describe, expect, test } from "bun:test";
import { SKIN_CONFIGS } from "@/components/skin-registry";
import { MODE_LOCKED_SKINS, MOTION_REDUCED_SKINS, THEME_INIT_SKIN_IDS, type Theme } from "@/components/theme";

/*
 * Guard: MODE_LOCKED_SKINS/MOTION_REDUCED_SKINS (theme.ts) are hand-kept mirrors of colorScheme/motion on each skin.config.
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
  const configSkinIds = Object.keys(SKIN_CONFIGS) as Array<keyof typeof SKIN_CONFIGS>;
  expect([...THEME_INIT_SKIN_IDS].sort()).toEqual(configSkinIds.sort());
});

describe("motion-reduced skins stay in sync with the skin.config contract", () => {
  const fromConfigs = Object.entries(SKIN_CONFIGS)
    .filter(([, config]) => config.motion === "reduced")
    .map(([id]) => id);

  test("MOTION_REDUCED_SKINS equals the set of skin.config motion:reduced fields", () => {
    expect([...MOTION_REDUCED_SKINS].sort()).toEqual(fromConfigs.sort());
  });

  test("xp is motion-reduced (sanity: the Luna near-instant motion reading)", () => {
    expect(SKIN_CONFIGS.xp.motion).toBe("reduced");
    expect(MOTION_REDUCED_SKINS).toContain("xp");
  });
});
