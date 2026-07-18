import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import skinContract from "../../../public/r/skin-contract.json";
import { appleLiquidGlassSurfaceSelector } from "./modern-apple/modern-apple-liquid-glass-runtime";

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

  test("every classified surface resolves to a supported anatomy part", () => {
    for (const references of Object.values(skinContract.semanticFamilies.surfaces)) {
      for (const { scope, part } of references) expect(hasContractPart(scope, part)).toBe(true);
    }
  });
});
