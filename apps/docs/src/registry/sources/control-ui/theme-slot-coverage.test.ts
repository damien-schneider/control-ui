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
});
