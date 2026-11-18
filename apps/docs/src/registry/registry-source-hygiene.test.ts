import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";

const REGISTRY_DIR = fileURLToPath(new URL("./", import.meta.url));

describe("registry source hygiene", () => {
  test("Rig component recipes work from nested and portalled skin scopes", () => {
    const rigSkin = postcss.parse(readFileSync(path.join(REGISTRY_DIR, "skin-packs/rig/skin.css"), "utf8"));
    const rootOnlyComponentSelectors: string[] = [];

    rigSkin.walkRules((rule) => {
      for (const selector of rule.selectors ?? []) {
        if (/:root\[data-skin="rig"\][^\s,]*\s+(?!body(?:\b|::))/.test(selector)) {
          rootOnlyComponentSelectors.push(selector.trim());
        }
      }
    });

    expect(rootOnlyComponentSelectors).toEqual([]);
  });
});
