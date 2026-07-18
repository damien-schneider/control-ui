import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/*
 * Portal effect-scope parity: portal-rendered surfaces re-assert BOTH skin scopes — data-skin={skinId()} (token/skin.css) and data-effects={skinEffects()} (control-effects) — must travel together.
 * A portal re-stamping skin but not effects silently drops ripple/top-shine on every control it hosts (a Button inside a Dialog): effects.css + ripple runtime resolve scope from nearest data-effects ANCESTOR, and a portal mounts under <body>, outside any in-tree scope.
 * Every data-skin={skinId()} stamp in Control UI sources needs a matching data-effects={skinEffects()} stamp in the same file, one-for-one.
 */

const UI_DIR = fileURLToPath(new URL("./ui/", import.meta.url));

const count = (haystack: string, needle: string) => haystack.split(needle).length - 1;

describe("portal skin stamps carry the effects scope", () => {
  const files = readdirSync(UI_DIR).filter((name) => name.endsWith(".tsx"));

  for (const name of files) {
    const source = readFileSync(path.join(UI_DIR, name), "utf8");
    const skinStamps = count(source, "data-skin={skinId()}");
    if (skinStamps === 0) continue;

    test(`${name} stamps data-effects beside each data-skin`, () => {
      expect(count(source, "data-effects={skinEffects()}")).toBe(skinStamps);
    });
  }
});
