import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import skinContract from "../../../../public/r/skin-contract.json";

const CSS = readFileSync(fileURLToPath(new URL("./theme.css", import.meta.url)), "utf8");

function anatomySelectors(css: string) {
  return [...css.matchAll(/\[data-control-ui="([^"]+)"\]\[data-slot="([^"]+)"\]/g)].map((match) => ({ scope: match[1], part: match[2] }));
}

function hasContractPart(scope: string, part: string) {
  if (!(scope in skinContract.scopes)) return false;
  return part in skinContract.scopes[scope as keyof typeof skinContract.scopes].parts;
}

describe("theme anatomy coverage", () => {
  test("every scoped selector resolves through the generated contract", () => {
    const unknown = anatomySelectors(CSS).filter(({ scope, part }) => !hasContractPart(scope, part));
    expect(unknown).toEqual([]);
  });

  test("surface corner geometry uses semantic roles instead of component lists", () => {
    expect(CSS).toContain(':where([data-control-ui][data-slot][data-surface="floating"])');
    expect(CSS).toContain(':where([data-control-ui][data-slot][data-surface="modal"], [data-control-ui][data-slot][data-surface="panel"])');
    expect(CSS).toContain('[data-control-ui="chat-message"][data-slot="root"]');
    expect(CSS).toContain('[data-control-ui="chat-input"][data-slot="root"]');
    expect(skinContract.semanticFamilies.surfaces.floating.length).toBeGreaterThan(10);
    expect(skinContract.semanticFamilies.surfaces.modal.length).toBeGreaterThanOrEqual(4);
    expect(skinContract.semanticFamilies.surfaces.panel.length).toBeGreaterThan(10);
  });

  test("the interactive control family contains only documented parts", () => {
    expect(skinContract.semanticFamilies.controls.length).toBeGreaterThan(10);
    for (const { scope, part } of skinContract.semanticFamilies.controls) {
      expect(hasContractPart(scope, part)).toBe(true);
    }
  });
});
