import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import skinContract from "../../../public/r/skin-contract.json";
import { SKIN_POPUP_PARTS } from "../skin";
import { skin as cuicui } from "./cuicui/skin.config";
import { skin as linear } from "./linear/skin.config";
import { appleLiquidGlassSurfaceSelector } from "./modern-apple/modern-apple-liquid-glass-runtime";
import { skin as modernApple } from "./modern-apple/skin.config";
import { skin as xp } from "./xp/skin.config";

const POPUP_FAMILY_SKINS = [cuicui, linear, modernApple, xp];

const MODERN_APPLE_CSS = readFileSync(fileURLToPath(new URL("./modern-apple/skin.css", import.meta.url)), "utf8");

// JSON import types each scope as its own literal key; reading map through record shape keeps runtime
// scope string indexable without asserting that key exists.
const contractScopes: Record<string, { parts: Record<string, unknown> }> = skinContract.scopes;

function hasContractPart(scope: string, part: string) {
  const contractScope = contractScopes[scope];
  return contractScope ? part in contractScope.parts : false;
}

describe("semantic surface roles", () => {
  test("Modern Apple material and runtime share the same role selector", () => {
    expect(MODERN_APPLE_CSS).toContain(
      ':is([data-control-ui][data-slot][data-surface="floating"], [data-control-ui][data-slot][data-surface="modal"])',
    );
    expect(appleLiquidGlassSurfaceSelector).toBe(
      '[data-control-ui][data-slot][data-surface="floating"], [data-control-ui][data-slot][data-surface="modal"]',
    );
  });

  test("advanced skins own shared popup styling through the family", () => {
    // list-content is the inner scroller; a pack may leave it on the recipe default.
    const optionalParts = new Set<string>(["list-content"]);
    const allowedParts: readonly string[] = SKIN_POPUP_PARTS;
    for (const skin of POPUP_FAMILY_SKINS) {
      const popup = skin.families?.popup ?? {};
      const declared = Object.keys(popup);
      for (const part of declared) expect(allowedParts).toContain(part);
      for (const part of SKIN_POPUP_PARTS) {
        if (!optionalParts.has(part)) expect(declared).toContain(part);
      }
      expect(Object.values(popup).every((classes) => classes.length > 0)).toBe(true);
      expect(skin.slots?.select?.content).toBeUndefined();
      expect(skin.slots?.["dropdown-menu"]?.content).toBeUndefined();
      expect(skin.slots?.["dropdown-menu"]?.item).toBeUndefined();
      expect(skin.slots?.["context-menu"]?.content).toBeUndefined();
      expect(skin.slots?.["context-menu"]?.["sub-content"]).toBeUndefined();
      expect(skin.slots?.menubar?.content).toBeUndefined();
      expect(skin.slots?.combobox?.content).toBeUndefined();
      expect(skin.slots?.autocomplete?.content).toBeUndefined();
      expect(skin.slots?.["trigger-menu"]?.root).toBeUndefined();
      expect(skin.slots?.popover?.content).toBeUndefined();
      expect(skin.slots?.["hover-card"]?.content).toBeUndefined();
    }
  });

  test("every classified surface resolves to a supported anatomy part", () => {
    for (const references of Object.values(skinContract.semanticFamilies.surfaces)) {
      for (const { scope, part } of references) expect(hasContractPart(scope, part)).toBe(true);
    }
  });

  test("every popup family member resolves to a supported anatomy part", () => {
    for (const references of Object.values(skinContract.semanticFamilies.popup)) {
      for (const { scope, part } of references) expect(hasContractPart(scope, part)).toBe(true);
    }
  });
});
