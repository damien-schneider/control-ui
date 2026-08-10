import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import skinContract from "../../../../public/r/skin-contract.json";

const CSS = readFileSync(fileURLToPath(new URL("./theme.css", import.meta.url)), "utf8");

function anatomySelectors(css: string) {
  return [...css.matchAll(/\[data-control-ui="([^"]+)"\]\[data-slot="([^"]+)"\]/g)].map((match) => ({ scope: match[1], part: match[2] }));
}

// JSON import types each scope as its own literal key; reading map through record shape keeps runtime
// scope string indexable without asserting that key exists.
const contractScopes: Record<string, { parts: Record<string, unknown> }> = skinContract.scopes;

function hasContractPart(scope: string, part: string) {
  const contractScope = contractScopes[scope];
  return contractScope ? part in contractScope.parts : false;
}

describe("theme anatomy coverage", () => {
  test("every scoped selector resolves through the generated contract", () => {
    const unknown = anatomySelectors(CSS).filter(({ scope, part }) => !hasContractPart(scope, part));
    expect(unknown).toEqual([]);
  });

  test("corner geometry rides the single --corner-shape knob on the universal anatomy selector", () => {
    expect(/:where\(\[data-control-ui\]\[data-slot\]\)\s*\{\s*corner-shape: var\(--corner-shape\);/.test(CSS)).toBe(true);
    expect(CSS).not.toContain("--corner-shape-control");
    expect(CSS).toContain('[data-control-ui="chat-message"][data-slot="root"]');
    expect(CSS).toContain('[data-control-ui="chat-composer"][data-slot="root"]');
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
