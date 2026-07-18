import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";

const REGISTRY_DIR = fileURLToPath(new URL("./", import.meta.url));

function registryFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? registryFiles(entryPath) : [entryPath];
  });
}

describe("registry source hygiene", () => {
  test("installable source stays text-searchable and contains no NUL bytes", () => {
    const filesWithNul = registryFiles(REGISTRY_DIR)
      .filter((file) => readFileSync(file).includes(0))
      .map((file) => path.relative(REGISTRY_DIR, file));

    expect(filesWithNul).toEqual([]);
  });

  test("installable CSS does not advertise retired Control UI filenames", () => {
    const obsoleteReferences = registryFiles(REGISTRY_DIR).flatMap((file) => {
      if (!file.endsWith(".css")) return [];
      const references = readFileSync(file, "utf8").match(/\b(?:app\/)?control-ui-[\w-]+\.css\b/g) ?? [];
      return references.map((reference) => `${path.relative(REGISTRY_DIR, file)}: ${reference}`);
    });

    expect(obsoleteReferences).toEqual([]);
  });

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

  test("semantic fill tokens are not reused as standalone text colors", () => {
    const standaloneFillText = /text-(?:primary|destructive)(?!-(?:foreground|text))(?=\b|\/)/g;
    const offenders = registryFiles(REGISTRY_DIR).flatMap((file) => {
      if (!/\.[cm]?[jt]sx?$/.test(file)) return [];
      const matches = readFileSync(file, "utf8").match(standaloneFillText) ?? [];
      return matches.map((match) => `${path.relative(REGISTRY_DIR, file)}: ${match}`);
    });

    expect(offenders).toEqual([]);
  });
});
