import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { type RegistryItem, registryItemSchema, registrySchema } from "shadcn/schema";
import { componentEntries } from "../app/(features)/catalog/components";
import { primitiveEntries } from "../app/(features)/catalog/primitives";
import { type CatalogSkinMeta, skinMetas } from "../app/(features)/catalog/skins";
import { importSpecifiers } from "./module-imports";

type RegistryFile = {
  path: string;
  target: string;
  type: string;
  content?: string;
};

type RegistryManifest = {
  name: string;
  type: string;
  dependencies: string[];
  registryDependencies: string[];
  files: RegistryFile[];
};

// The shadcn schema leaves dependency arrays, files, and some targets optional; our generator always emits them, so normalize the parsed item to the strict local shape (empty target still fails the incomplete-file check).
function manifestFromItem(item: RegistryItem): RegistryManifest {
  return {
    name: item.name,
    type: item.type,
    dependencies: item.dependencies ?? [],
    registryDependencies: item.registryDependencies ?? [],
    files: (item.files ?? []).map((file) => ({ path: file.path, target: file.target ?? "", type: file.type, content: file.content })),
  };
}

const root = process.cwd();
const registrySourceRoot = path.join(root, "src/registry");
const blocksRoot = path.join(registrySourceRoot, "blocks");
const sourcesRoot = path.join(registrySourceRoot, "sources");
const skinPacksRoot = path.join(registrySourceRoot, "skin-packs");
const registryRoot = path.join(root, "registry");
const publicRegistryRoot = path.join(root, "public/r");
const failures: string[] = [];

function walk(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = path.join(directory, entry);
    return statSync(fullPath).isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function parseJson(filePath: string): unknown {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`${path.relative(root, filePath)} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
    return undefined;
  }
}

function packageName(specifier: string) {
  if (specifier.startsWith("@")) return specifier.split("/").slice(0, 2).join("/");
  return specifier.split("/")[0];
}

function dependencyPackageName(specifier: string) {
  if (!specifier.startsWith("@")) return specifier.split("@")[0];
  const versionSeparator = specifier.indexOf("@", specifier.indexOf("/") + 1);
  return versionSeparator === -1 ? specifier : specifier.slice(0, versionSeparator);
}

function importsRuntime(source: string) {
  return /(@mastra\/|from\s+["']ai["']|from\s+["']@ai-sdk\/|from\s+["']langchain|from\s+["']@langchain\/)/.test(source);
}

function usesRuntimeProvider(source: string) {
  return /(@assistant-ui|AssistantRuntimeProvider|RuntimeProvider|useChatRuntime|useAssistantRuntime)/.test(source);
}

const componentFiles = componentEntries.map((component) => `${component.id}.tsx`);
const documentedComponents = new Set<string>(componentEntries.map((component) => component.id));
const documentedPrimitives = new Set<string>(primitiveEntries.map((primitive) => primitive.id));
const coreBlockImports = new Set(["contracts", "skin"]);

for (const sourceName of readdirSync(sourcesRoot)) {
  const sourcePath = path.join(sourcesRoot, sourceName);
  if (!statSync(sourcePath).isDirectory()) continue;

  for (const component of componentFiles) {
    const componentPath = path.join(sourcePath, component);
    if (!existsSync(componentPath)) {
      failures.push(`source "${sourceName}" is missing ${component}`);
      continue;
    }

    const source = readFileSync(componentPath, "utf8");
    if (importsRuntime(source)) failures.push(`source "${sourceName}" mixes runner imports in ${component}`);
    if (/create(ChatMessage|ChatComposer)Component/.test(source)) {
      failures.push(`source "${sourceName}" uses a component factory in ${component}; sources must install explicit TSX`);
    }
  }
}

for (const sourcePath of walk(registrySourceRoot).filter((file) => /\.(ts|tsx)$/.test(file))) {
  const source = readFileSync(sourcePath, "utf8");
  const relativePath = path.relative(root, sourcePath);
  const isProviderAgnosticSource =
    relativePath.includes("src/registry/sources/") ||
    relativePath.includes("src/registry/hooks/") ||
    relativePath.includes("src/registry/blocks/") ||
    relativePath.includes("src/registry/lib/") ||
    relativePath === "src/registry/contracts.ts";

  if (isProviderAgnosticSource && usesRuntimeProvider(source)) {
    failures.push(`${relativePath} uses a runtime provider API; installable Control UI must stay runner-agnostic`);
  }
  if (isProviderAgnosticSource && importsRuntime(source)) {
    failures.push(`${relativePath} imports runner code; keep provider integration in previews, usage examples, or host-app code`);
  }
  if (source.includes("forwardRef")) failures.push(`${relativePath} uses forwardRef; use React 19 function components`);
  if (/from\s+["']@\/components\/ui\//.test(source)) {
    failures.push(`${relativePath} imports the host's components/ui tree; Control UI must own components/control-ui`);
  }
  if (source.includes("useCallback")) {
    failures.push(`${relativePath} uses useCallback; keep handlers simple unless a measured case needs memoization`);
  }
  if (/<ActionBar[\s\S]*?\bitems=/.test(source)) {
    failures.push(`${relativePath} passes ActionBar items as data; compose ActionBarItem children`);
  }
  if (/<CodeBlockEditor[\s\S]*?\boptions=/.test(source)) {
    failures.push(`${relativePath} passes CodeBlockEditor options as data; compose its controls`);
  }
  if (/\b(CodeBlockEditorOption|CodeBlockEditorSelector|optionValue|defaultOptionValue|onOptionValueChange)\b/.test(source)) {
    failures.push(`${relativePath} exposes CodeBlockEditor option-selection props; keep selection in composed controls`);
  }
  if (/<ActionBarItem[^>]*>\s*Copy\s*<\/ActionBarItem>/.test(source)) {
    failures.push(`${relativePath} renders Copy as a generic ActionBarItem; use ActionBarCopy`);
  }
  if (/\bclassNames\b/.test(source)) failures.push(`${relativePath} uses a classNames slot bag; expose compound parts instead`);
  if (/<ChatComposer[\s\S]*?\b(tools|modelSelector|submitLabel)=/.test(source)) {
    failures.push(`${relativePath} passes visual ChatComposer props; compose its toolbar, tools, and submit parts`);
  }
}

for (const blockPath of walk(blocksRoot).filter((file) => file.endsWith(".tsx"))) {
  const source = readFileSync(blockPath, "utf8");
  const relativePath = path.relative(root, blockPath);
  const imports = [...source.matchAll(/from\s+["']@\/components\/control-ui\/([^"']+)["']/g)].map((match) => match[1]);

  for (const importPath of imports) {
    if (importPath.startsWith("ui/")) {
      const primitiveId = importPath.slice("ui/".length);
      if (!documentedPrimitives.has(primitiveId)) failures.push(`${relativePath} imports undocumented primitive "${primitiveId}"`);
      continue;
    }
    if (importPath.includes("/")) continue;
    if (coreBlockImports.has(importPath)) continue;
    if (!documentedComponents.has(importPath)) failures.push(`${relativePath} imports undocumented agent "${importPath}"`);
  }
}

const manifests = new Map<string, RegistryManifest>();
const manifestPaths = walk(registryRoot).filter((file) => file.endsWith(".json"));

for (const manifestPath of manifestPaths) {
  const value = parseJson(manifestPath);
  if (!value) continue;
  const result = registryItemSchema.safeParse(value);
  if (!result.success) {
    failures.push(`${path.relative(root, manifestPath)} fails the shadcn registry-item schema: ${result.error.message}`);
    continue;
  }
  const manifest = manifestFromItem(result.data);
  if (manifests.has(manifest.name)) failures.push(`registry item "${manifest.name}" has more than one source manifest`);
  manifests.set(manifest.name, manifest);
}

const sourceRegistryPath = path.join(root, "registry.json");
const sourceRegistry = parseJson(sourceRegistryPath);
if (sourceRegistry) {
  const result = registrySchema.safeParse(sourceRegistry);
  if (!result.success) failures.push(`registry.json fails the shadcn registry schema: ${result.error.message}`);
}

const activeSkinTargets = new Set([
  "@components/control-ui/skin.config.tsx",
  "@components/control-ui/styles/skin-theme.css",
  "@components/control-ui/styles/skin.css",
]);
const nextStarterTargets = new Set(["~/app/layout.tsx", "~/app/page.tsx"]);
const activeSkinConfigPeer = {
  importer: "src/registry/skin.ts",
  specifier: "./skin.config",
} as const;
const hostOwnedSourceImports = new Set([
  "src/registry/starters/next/layout.tsx::./globals.css",
  "src/registry/starters/next/layout.tsx::next",
  "src/registry/starters/next/layout.tsx::next/font/google",
]);
const ownerByTarget = new Map<string, string>();
const targetBySource = new Map<string, string>();

for (const [id, manifest] of manifests) {
  for (const dependency of manifest.dependencies) {
    if (!dependency.trim()) failures.push(`${id} declares an empty package dependency`);
  }
  for (const dependency of manifest.registryDependencies) {
    if (!manifests.has(dependency)) failures.push(`${id} depends on unknown registry item "${dependency}"`);
  }

  for (const file of manifest.files) {
    if (!file.path || !file.target || !file.type) {
      failures.push(`${id} has an incomplete file entry`);
      continue;
    }
    const isNextStarterTarget = id === "next-app" && nextStarterTargets.has(file.target);
    if (!file.target.startsWith("@components/control-ui/") && !isNextStarterTarget) {
      failures.push(`${id} writes ${file.target}; all install targets must derive from the consumer's components alias`);
    }
    if (file.target.includes("/primitives/") || file.target.includes("/adapters/")) {
      failures.push(`${id} writes the obsolete target ${file.target}`);
    }
    if (file.target.includes("/hooks/") && !/@components\/control-ui\/hooks\/use-[^/]+\.ts$/.test(file.target)) {
      failures.push(`${id} has a hook target that is not hooks/use-*.ts: ${file.target}`);
    }
    const absoluteSource = path.join(root, file.path);
    if (!existsSync(absoluteSource)) failures.push(`${id} references missing ${file.path}`);

    const isActiveSkinTarget = activeSkinTargets.has(file.target);
    if (isActiveSkinTarget && !id.startsWith("skin-")) failures.push(`${id} owns active skin target ${file.target}`);

    const owner = ownerByTarget.get(file.target);
    const sharedBySkins = isActiveSkinTarget && owner?.startsWith("skin-") && id.startsWith("skin-");
    if (owner && owner !== id && !sharedBySkins) {
      failures.push(`${file.target} is owned by both ${owner} and ${id}`);
    } else if (!owner) {
      ownerByTarget.set(file.target, id);
    }
    targetBySource.set(file.path, file.target);
  }
}

const coreManifest = manifests.get("core");
if (!coreManifest) {
  failures.push('registry is missing the "core" item');
} else {
  if (coreManifest.registryDependencies.some((dependency) => dependency.startsWith("skin-"))) {
    failures.push("core must not depend on a skin");
  }
  for (const target of activeSkinTargets) {
    if (coreManifest.files.some((file) => file.target === target)) failures.push(`core owns active skin target ${target}`);
  }
}

for (const [id, manifest] of manifests) {
  if (!id.startsWith("skin-")) continue;

  const activeFiles = manifest.files.filter((file) => activeSkinTargets.has(file.target));
  const ownedTargets = new Set(activeFiles.map((file) => file.target));
  const missingTargets = [...activeSkinTargets].filter((target) => !ownedTargets.has(target));
  if (missingTargets.length > 0) failures.push(`${id} is missing active skin targets: ${missingTargets.join(", ")}`);
  if (activeFiles.length !== activeSkinTargets.size) failures.push(`${id} must own each active skin target exactly once`);
  if (!manifest.registryDependencies.includes("core")) failures.push(`${id} must depend on core`);
  if (manifest.registryDependencies.some((dependency) => dependency.startsWith("skin-"))) {
    failures.push(`${id} must not depend on another skin`);
  }
}

function validateDependencyCycles() {
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const stack: string[] = [];
  const reported = new Set<string>();

  function visit(id: string) {
    if (visiting.has(id)) {
      const cycleStart = stack.indexOf(id);
      const cycle = [...stack.slice(cycleStart), id].join(" -> ");
      if (!reported.has(cycle)) {
        reported.add(cycle);
        failures.push(`registry dependency cycle: ${cycle}`);
      }
      return;
    }
    if (visited.has(id)) return;

    visiting.add(id);
    stack.push(id);
    for (const dependency of manifests.get(id)?.registryDependencies ?? []) {
      if (manifests.has(dependency)) visit(dependency);
    }
    stack.pop();
    visiting.delete(id);
    visited.add(id);
  }

  for (const id of manifests.keys()) visit(id);
}

validateDependencyCycles();

function dependencyClosure(id: string, seen = new Set<string>()): RegistryManifest[] {
  if (seen.has(id)) return [];
  seen.add(id);
  const manifest = manifests.get(id);
  if (!manifest) return [];
  return [manifest, ...manifest.registryDependencies.flatMap((dependency) => dependencyClosure(dependency, seen))];
}

function resolveSourceImport(importer: string, specifier: string) {
  const base = path.posix.normalize(path.posix.join(path.posix.dirname(importer), specifier));
  return [base, `${base}.ts`, `${base}.tsx`, `${base}.css`, `${base}/index.ts`, `${base}/index.tsx`].find((candidate) =>
    targetBySource.has(candidate),
  );
}

function targetCandidates(base: string) {
  return [base, `${base}.ts`, `${base}.tsx`, `${base}.css`, `${base}/index.ts`, `${base}/index.tsx`];
}

for (const [id, manifest] of manifests) {
  const closure = dependencyClosure(id);
  const closureTargets = new Set(closure.flatMap((item) => item.files.map((file) => file.target)));

  for (const file of manifest.files) {
    const absoluteSource = path.join(root, file.path);
    if (!existsSync(absoluteSource) || !/\.(ts|tsx)$/.test(file.path)) continue;

    for (const specifier of importSpecifiers(file.path, readFileSync(absoluteSource, "utf8"))) {
      if (file.path === activeSkinConfigPeer.importer && specifier === activeSkinConfigPeer.specifier) continue;
      if (hostOwnedSourceImports.has(`${file.path}::${specifier}`)) continue;

      let requiredTargets: string[] | undefined;
      if (specifier.startsWith(".")) {
        const sourceDependency = resolveSourceImport(file.path, specifier);
        if (!sourceDependency) {
          failures.push(`${id}: cannot resolve ${specifier} from ${file.path}`);
          continue;
        }
        const target = targetBySource.get(sourceDependency);
        requiredTargets = target ? [target] : undefined;
      } else if (specifier.startsWith("@/components/control-ui/")) {
        requiredTargets = targetCandidates(`@components/control-ui/${specifier.slice("@/components/control-ui/".length)}`);
      } else if (specifier.startsWith("@/")) {
        failures.push(`${id}: ${file.path} imports project-local ${specifier}; registry source must be self-contained`);
        continue;
      } else if (!specifier.startsWith("node:") && specifier !== "react" && specifier !== "react-dom") {
        const dependency = packageName(specifier);
        if (!manifest.dependencies.some((dependencySpecifier) => dependencyPackageName(dependencySpecifier) === dependency)) {
          failures.push(`${id}: ${file.path} imports ${dependency} but the item does not declare it`);
        }
        continue;
      } else {
        continue;
      }

      if (requiredTargets && !requiredTargets.some((target) => closureTargets.has(target))) {
        failures.push(`${id}: ${file.path} imports ${specifier}, missing from its registry dependency closure`);
      }
    }
  }
}

const expectedPublicFiles = new Set(["registry.json", "agent-index.json", "skin-contract.json", "theme-contract.json"]);

for (const [id, manifest] of manifests) {
  const publicPath = path.join(publicRegistryRoot, `${id}.json`);
  expectedPublicFiles.add(`${id}.json`);
  if (!existsSync(publicPath)) {
    failures.push(`${id} has no built public/r/${id}.json payload`);
    continue;
  }

  const value = parseJson(publicPath);
  if (!value) continue;
  const result = registryItemSchema.safeParse(value);
  if (!result.success) {
    failures.push(`public/r/${id}.json fails the shadcn registry-item schema: ${result.error.message}`);
    continue;
  }
  const publicItem = manifestFromItem(result.data);
  if (publicItem.files.length !== manifest.files.length) failures.push(`public/r/${id}.json has a different file count than its source`);
  for (const sourceFile of manifest.files) {
    const builtFile = publicItem.files.find((file) => file.path === sourceFile.path && file.target === sourceFile.target);
    if (!builtFile) {
      failures.push(`public/r/${id}.json omits ${sourceFile.path} -> ${sourceFile.target}`);
      continue;
    }
    const expectedContent = readFileSync(path.join(root, sourceFile.path), "utf8");
    if (builtFile.content !== expectedContent) failures.push(`public/r/${id}.json has stale content for ${sourceFile.path}`);
  }
  for (const dependency of manifest.registryDependencies) {
    if (!publicItem.registryDependencies.some((url) => url.endsWith(`/r/${dependency}.json`))) {
      failures.push(`public/r/${id}.json does not publish the dependency URL for ${dependency}`);
    }
  }
}

const publicRegistryPath = path.join(publicRegistryRoot, "registry.json");
if (!existsSync(publicRegistryPath)) {
  failures.push("public/r/registry.json is missing");
} else {
  const value = parseJson(publicRegistryPath);
  if (value) {
    const result = registrySchema.safeParse(value);
    if (!result.success) failures.push(`public/r/registry.json fails the shadcn registry schema: ${result.error.message}`);
  }
}

if (existsSync(publicRegistryRoot)) {
  for (const publicPath of walk(publicRegistryRoot).filter((file) => file.endsWith(".json"))) {
    const relativePath = path.relative(publicRegistryRoot, publicPath);
    if (!expectedPublicFiles.has(relativePath)) failures.push(`public/r/${relativePath} is stale`);
  }
}

for (const packId of readdirSync(skinPacksRoot)) {
  const packDir = path.join(skinPacksRoot, packId);
  if (!statSync(packDir).isDirectory()) continue;
  for (const required of ["theme.css", "skin.css", "skin.config.tsx"]) {
    if (!existsSync(path.join(packDir, required))) failures.push(`skin pack "${packId}" is missing ${required}`);
  }
}

const catalogSkinMetas: readonly CatalogSkinMeta[] = skinMetas;
for (const meta of catalogSkinMetas) {
  if (meta.packManifestPath && !existsSync(path.join(root, meta.packManifestPath))) {
    failures.push(`skin "${meta.id}" declares missing ${meta.packManifestPath}`);
  }
  for (const file of meta.paths ?? []) {
    if (!existsSync(path.join(root, file.path))) failures.push(`skin "${meta.id}" lists missing docs path ${file.path}`);
  }
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`Registry validation passed (${manifests.size} items, dependency closure and public payloads verified).`);
