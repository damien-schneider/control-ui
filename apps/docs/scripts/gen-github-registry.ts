import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { registrySchema } from "shadcn/schema";
import { siteConfig } from "@/lib/site-config";
import { createRegistryItems } from "./registry-model";

const checkOnly = process.argv.includes("--check");
const root = process.cwd();
const repoRoot = path.join(root, "../..");
const docsPrefix = path.relative(repoRoot, root);
// Served raw from GitHub, so no Vercel build rewrites env-derived URLs into it.
const productionHomepage = "https://control-ui.dev";

const items = createRegistryItems()
  .filter((item) => !item.meta?.internal)
  .map((item) => {
    const { sourceManifestPath: _sourceManifestPath, ...meta } = item.meta ?? { sourceManifestPath: "" };
    return {
      ...item,
      registryDependencies: item.registryDependencies.map((id) => `${siteConfig.registry.githubRepo}/${id}`),
      files: item.files.map((file) => ({ ...file, path: path.posix.join(docsPrefix, file.path) })),
      meta: Object.keys(meta).length > 0 ? meta : undefined,
    };
  });

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: siteConfig.registry.name,
  homepage: productionHomepage,
  items,
};
const result = registrySchema.safeParse(registry);
if (!result.success) throw new Error(result.error.message);

const outputPath = path.join(repoRoot, "registry.json");
const expected = `${JSON.stringify(registry, null, 2)}\n`;
const current = existsSync(outputPath) ? readFileSync(outputPath, "utf8") : undefined;

if (current !== expected) {
  if (checkOnly) {
    console.error("- registry.json (repo root, GitHub registry) is out of date; run `bun run sync`");
    process.exit(1);
  }
  writeFileSync(outputPath, expected);
}

console.log(checkOnly ? "GitHub registry is in sync." : `GitHub registry built (${items.length} items).`);
