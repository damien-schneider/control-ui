import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import skinContract from "../../../public/r/skin-contract.json";
import { knobPrefix } from "../../../scripts/knob-contracts/collect";
import { popupParts } from "../sources/control-ui/surface-variants";

const popupSkinCss = ["cuicui", "linear", "modern-apple", "xp"].map((skin) => ({
  skin,
  css: readFileSync(fileURLToPath(new URL(`./${skin}/skin.css`, import.meta.url)), "utf8"),
}));

const contractScopes: Record<string, { parts: Record<string, unknown> }> = skinContract.scopes;

function hasContractPart(scope: string, part: string) {
  const contractScope = contractScopes[scope];
  return contractScope ? part in contractScope.parts : false;
}

describe("semantic surface roles", () => {
  test("advanced skins re-value popup knobs in CSS", () => {
    for (const { skin, css } of popupSkinCss) {
      expect(css).toContain(`[data-skin="${skin}"]`);
      expect(css).toContain(`${knobPrefix}popup-`);
    }
  });

  test("every classified surface resolves to a supported anatomy part", () => {
    for (const references of Object.values(skinContract.semanticFamilies.surfaces)) {
      for (const { scope, part } of references) expect(hasContractPart(scope, part)).toBe(true);
    }
  });

  test("every popup family member resolves to a supported anatomy part", () => {
    expect(Object.keys(skinContract.semanticFamilies.popup).toSorted()).toEqual(popupParts.toSorted());
    for (const references of Object.values(skinContract.semanticFamilies.popup)) {
      for (const { scope, part } of references) expect(hasContractPart(scope, part)).toBe(true);
    }
  });
});
