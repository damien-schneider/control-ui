import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const UI_DIR = fileURLToPath(new URL("./ui/", import.meta.url));

const count = (haystack: string, needle: string) => haystack.split(needle).length - 1;

describe("portal skin stamps carry the effects scope", () => {
  const files = readdirSync(UI_DIR).filter((name) => name.endsWith(".tsx"));

  for (const name of files) {
    const source = readFileSync(path.join(UI_DIR, name), "utf8");
    const skinStamps = count(source, "data-skin={skin.id}");
    if (skinStamps === 0) continue;

    test(`${name} stamps data-effects beside each data-skin`, () => {
      expect(count(source, "data-effects={controlEffectsAttribute(skin.effects)}")).toBe(skinStamps);
    });
  }
});
