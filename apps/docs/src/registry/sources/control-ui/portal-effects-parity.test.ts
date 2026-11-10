import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SOURCES_DIR = fileURLToPath(new URL("./", import.meta.url));

const handStampedScopeAttributes = [
  "data-skin={skin.id}",
  "data-effects={controlEffectsAttribute(skin.effects)}",
  "data-motion={skin.motion}",
];

describe("portalled surfaces re-create the whole skin scope", () => {
  const files = readdirSync(SOURCES_DIR, { encoding: "utf8", recursive: true }).filter(
    (name) => name.endsWith(".tsx") && !name.includes(".test."),
  );

  test("no surface stamps one scope attribute by hand", () => {
    const offenders = files.filter((name) => {
      const source = readFileSync(path.join(SOURCES_DIR, name), "utf8");
      return handStampedScopeAttributes.some((attribute) => source.includes(attribute));
    });
    expect(offenders).toEqual([]);
  });
});
