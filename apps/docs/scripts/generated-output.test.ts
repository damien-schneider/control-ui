import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import path from "node:path";

const repositoryRoot = path.resolve(process.cwd(), "../..");
const generatedTypeScript = [
  "apps/docs/app/(features)/model/generated-registry.ts",
  "apps/docs/app/(features)/model/generated-skin-contract.ts",
  "apps/docs/src/registry/knob-contracts",
];

describe("generated TypeScript", () => {
  test("stays formatter-owned, so format:check covers it", () => {
    const biomeConfig = JSON.parse(readFileSync(path.join(repositoryRoot, "biome.json"), "utf8"));
    for (const file of generatedTypeScript) expect(biomeConfig.files.includes).not.toContain(`!${file}`);
  });

  test("keeps the generated skin contract out of Client Component bundles", () => {
    const source = readFileSync(path.join(repositoryRoot, generatedTypeScript[1]), "utf8");
    expect(source).toStartWith('import "server-only";\n');
  });
});
