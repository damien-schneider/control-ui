import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { registryItemSchema, registrySchema } from "shadcn/schema";
import { siteConfig } from "@/lib/site-config";
import { createRegistryItems, publicRegistryDependency } from "./registry-model";

const checkOnly = process.argv.includes("--check");
const root = process.cwd();
const publicRoot = path.join(root, "public/r");
const items = createRegistryItems();
const expected = new Map<string, string>();

const publicItems = items.map((item) => {
  const { sourceManifestPath: _sourceManifestPath, ...meta } = item.meta ?? { sourceManifestPath: "" };
  const built = {
    ...item,
    registryDependencies: item.registryDependencies.map(publicRegistryDependency),
    files: item.files.map((file) => ({
      ...file,
      content: readFileSync(path.join(root, file.path), "utf8"),
    })),
    meta: Object.keys(meta).length > 0 ? meta : undefined,
  };
  const result = registryItemSchema.safeParse(built);
  if (!result.success) throw new Error(`${item.name}: ${result.error.message}`);
  expected.set(`${item.name}.json`, `${JSON.stringify(built, null, 2)}\n`);
  return built;
});

const registryIndex = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: siteConfig.registry.name,
  homepage: siteConfig.url.origin,
  items: publicItems
    .filter((item) => !item.meta?.internal)
    .map((item) => ({
      ...item,
      files: item.files.map(({ content: _content, ...file }) => file),
    })),
};
const registryResult = registrySchema.safeParse(registryIndex);
if (!registryResult.success) throw new Error(registryResult.error.message);
expected.set("registry.json", `${JSON.stringify(registryIndex, null, 2)}\n`);

const failures: string[] = [];
for (const [fileName, content] of expected) {
  const filePath = path.join(publicRoot, fileName);
  const current = existsSync(filePath) ? readFileSync(filePath, "utf8") : undefined;
  if (current === content) continue;
  if (checkOnly) {
    failures.push(`public/r/${fileName} is out of date`);
    continue;
  }
  mkdirSync(publicRoot, { recursive: true });
  writeFileSync(filePath, content);
}

if (!checkOnly && existsSync(publicRoot)) {
  const expectedNames = new Set(expected.keys());
  expectedNames.add("agent-index.json");
  expectedNames.add("skin-contract.json");
  expectedNames.add("theme-contract.json");
  for (const filePath of new Bun.Glob("**/*.json").scanSync({ cwd: publicRoot })) {
    if (!expectedNames.has(filePath)) rmSync(path.join(publicRoot, filePath));
  }
  for (const entry of readdirSync(publicRoot, { withFileTypes: true })) {
    if (entry.isDirectory()) rmSync(path.join(publicRoot, entry.name), { recursive: true, force: true });
  }
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}; run \`bun run sync\``).join("\n"));
  process.exit(1);
}

console.log(checkOnly ? "Public shadcn registry is in sync." : `Public shadcn registry built (${publicItems.length} items).`);
