import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import skinContract from "../../../public/r/skin-contract.json";
import { skin as cuicui } from "./cuicui/skin.config";
import { skin as linear } from "./linear/skin.config";
import { appleLiquidGlassSurfaceSelector } from "./modern-apple/modern-apple-liquid-glass-runtime";
import { skin as modernApple } from "./modern-apple/skin.config";
import { skin as xp } from "./xp/skin.config";

const POPUP_FAMILY_SKINS = [cuicui, linear, modernApple, xp];

const MODERN_APPLE_CSS = readFileSync(fileURLToPath(new URL("./modern-apple/skin.css", import.meta.url)), "utf8");
const CORE_CSS = readFileSync(fileURLToPath(new URL("../sources/control-ui/theme.css", import.meta.url)), "utf8");

function hasContractPart(scope: string, part: string) {
  if (!(scope in skinContract.scopes)) return false;
  return part in skinContract.scopes[scope as keyof typeof skinContract.scopes].parts;
}

describe("semantic surface roles", () => {
  test("core corner geometry is role-driven", () => {
    expect(CORE_CSS).toContain(':where([data-control-ui][data-slot][data-surface="floating"])');
    expect(CORE_CSS).toContain(
      ':where([data-control-ui][data-slot][data-surface="modal"], [data-control-ui][data-slot][data-surface="panel"])',
    );
  });

  test("Modern Apple material and runtime share the same role selector", () => {
    expect(MODERN_APPLE_CSS).toContain(
      ':is([data-control-ui][data-slot][data-surface="floating"], [data-control-ui][data-slot][data-surface="modal"])',
    );
    expect(appleLiquidGlassSurfaceSelector).toBe(
      '[data-control-ui][data-slot][data-surface="floating"], [data-control-ui][data-slot][data-surface="modal"]',
    );
  });

  test("advanced skins own shared popup styling through the family", () => {
    for (const skin of POPUP_FAMILY_SKINS) {
      expect(Object.keys(skin.families?.popup ?? {}).sort()).toEqual(["item", "label", "list-surface", "separator", "shortcut", "surface"]);
      expect(Object.values(skin.families?.popup ?? {}).every((classes) => classes.length > 0)).toBe(true);
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
