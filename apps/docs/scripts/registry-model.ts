import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import type { RegistryItem } from "shadcn/schema";
import { blockEntries } from "@/app/(features)/catalog/blocks";
import { componentEntries } from "@/app/(features)/catalog/components";
import { extensionEntries } from "@/app/(features)/catalog/extensions";
import { primitiveEntries } from "@/app/(features)/catalog/primitives";
import { includesString } from "@/app/(features)/catalog/shared";
import { skinMetas } from "@/app/(features)/catalog/skins";
import { env } from "@/env";
import { siteConfig } from "@/lib/site-config";
import { importSpecifiers } from "./module-imports";

export type RegistryFileType =
  | "registry:block"
  | "registry:component"
  | "registry:file"
  | "registry:hook"
  | "registry:lib"
  | "registry:page"
  | "registry:ui";

export type RegistrySourceFile = {
  path: string;
  target: string;
  type: RegistryFileType;
};

export type RegistrySourceItem = {
  $schema: "https://ui.shadcn.com/schema/registry-item.json";
  name: string;
  type: "registry:base" | "registry:block" | "registry:component" | "registry:item" | "registry:style" | "registry:theme" | "registry:ui";
  title: string;
  description: string;
  docs?: string;
  dependencies: string[];
  registryDependencies: string[];
  files: RegistrySourceFile[];
  css?: RegistryItem["css"];
  meta?: { internal?: boolean; sourceManifestPath: string };
};

type Definition = {
  id: string;
  type: RegistrySourceItem["type"];
  title: string;
  description: string;
  seeds: string[];
  primary: string[];
  dependencies?: string[];
  css?: RegistryItem["css"];
  docs?: string;
  internal?: boolean;
  sourceManifestPath?: string;
};

const root = process.cwd();
const componentRoot = siteConfig.registry.componentRoot;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function dependencyVersions(manifest: unknown, key: string): Record<string, string> {
  if (!isRecord(manifest)) return {};
  const section = manifest[key];
  if (!isRecord(section)) return {};
  const versions: Record<string, string> = {};
  for (const [name, version] of Object.entries(section)) {
    if (typeof version === "string") versions[name] = version;
  }
  return versions;
}

const projectPackage: unknown = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
const packageVersions = { ...dependencyVersions(projectPackage, "dependencies"), ...dependencyVersions(projectPackage, "devDependencies") };
const activeSkinConfigPeer = {
  importer: "src/registry/skin.ts",
  source: "src/registry/skin.config.tsx",
} as const;
const hostOwnedRelativeImports = new Set(["src/registry/starters/next/layout.tsx::./globals.css"]);
const hostOwnedPackageImports = new Set([
  "src/registry/starters/next/layout.tsx::next",
  "src/registry/starters/next/layout.tsx::next/font/google",
]);

const coreFiles = [
  "src/registry/contracts.ts",
  "src/registry/skin.ts",
  "src/registry/lib/cn.ts",
  "src/registry/hooks/use-copy-to-clipboard.ts",
  "src/registry/sources/control-ui/control-variants.ts",
  "src/registry/sources/control-ui/surface-variants.ts",
  "src/registry/sources/control-ui/theme.css",
  "src/registry/sources/control-ui/effects.css",
] as const;

const internalDefinitions: Definition[] = [
  {
    id: "breadcrumb",
    type: "registry:ui",
    title: "Breadcrumb",
    description: "Semantic breadcrumb styled with Control UI tokens.",
    seeds: ["src/registry/sources/control-ui/ui/breadcrumb.tsx"],
    primary: ["src/registry/sources/control-ui/ui/breadcrumb.tsx"],
    internal: true,
  },
  {
    id: "label",
    type: "registry:ui",
    title: "Label",
    description: "Accessible form label used by composed controls.",
    seeds: ["src/registry/sources/control-ui/ui/label.tsx"],
    primary: ["src/registry/sources/control-ui/ui/label.tsx"],
    internal: true,
  },
  {
    id: "liquid-glass-optics",
    type: "registry:item",
    title: "Liquid Glass optics",
    description: "Shared continuous optical field for refractive glass surfaces.",
    seeds: ["src/registry/lib/liquid-glass-optics.ts"],
    primary: ["src/registry/lib/liquid-glass-optics.ts"],
    internal: true,
  },
  {
    id: "model-switcher",
    type: "registry:component",
    title: "Model switcher",
    description: "Model selection composition used by chat surfaces.",
    seeds: ["src/registry/sources/control-ui/model-switcher.tsx"],
    primary: ["src/registry/sources/control-ui/model-switcher.tsx"],
    internal: true,
  },
  {
    id: "separator",
    type: "registry:ui",
    title: "Separator",
    description: "Hairline divider using the shared border token.",
    seeds: ["src/registry/sources/control-ui/ui/separator.tsx"],
    primary: ["src/registry/sources/control-ui/ui/separator.tsx"],
    internal: true,
  },
  {
    id: "sheet",
    type: "registry:ui",
    title: "Sheet",
    description: "Side-anchored dialog for mobile and off-canvas surfaces.",
    seeds: ["src/registry/sources/control-ui/ui/sheet.tsx"],
    primary: ["src/registry/sources/control-ui/ui/sheet.tsx"],
    internal: true,
  },
  {
    id: "sidebar-layout-block",
    type: "registry:block",
    title: "Sidebar layout",
    description: "Application shell composed from the Control UI Sidebar.",
    seeds: ["src/registry/blocks/control-ui/sidebar-layout.tsx"],
    primary: ["src/registry/blocks/control-ui/sidebar-layout.tsx"],
    internal: true,
  },
  {
    id: "track-highlight",
    type: "registry:component",
    title: "Track highlight",
    description: "Shared sliding selection indicator for tracked lists.",
    seeds: [
      "src/registry/sources/control-ui/extensions/create-track-highlight.ts",
      "src/registry/sources/control-ui/extensions/track-highlight.tsx",
    ],
    primary: ["src/registry/sources/control-ui/extensions/track-highlight.tsx"],
    internal: true,
  },
];

function sourcePath(file: { path: string }) {
  return file.path;
}

function optionalPaths(entry: object, key: string): string[] {
  if (!isRecord(entry)) return [];
  const value = entry[key];
  if (!Array.isArray(value)) return [];
  return value.flatMap((file) => (isRecord(file) && typeof file.path === "string" ? [file.path] : []));
}

function componentDefinitions(): Definition[] {
  const components = componentEntries.map<Definition>((entry) => {
    const files = [entry.paths.source.path];
    if ("hook" in entry.paths) files.push(entry.paths.hook.path);
    files.push(...optionalPaths(entry.paths, "supportFiles"));
    return {
      id: entry.id,
      type: "registry:component",
      title: entry.name,
      description: entry.summary,
      seeds: files,
      primary: [entry.paths.source.path],
      dependencies: "usesPrimitives" in entry ? [...entry.usesPrimitives] : undefined,
    };
  });

  const audioVisualizer = componentEntries.find((entry) => entry.id === "audio-visualizer");
  if (audioVisualizer && "versions" in audioVisualizer) {
    const line = audioVisualizer.versions.find((version) => version.id === "line");
    if (line) {
      components.push({
        id: "audio-visualizer-line",
        type: "registry:component",
        title: "AudioVisualizer — line",
        description: "Line rendering of the shared realtime audio visualizer contract.",
        seeds: [line.paths.source.path],
        primary: [line.paths.source.path],
      });
    }
  }

  return components;
}

function primitiveDefinitions(): Definition[] {
  return primitiveEntries.map<Definition>((entry) => ({
    id: entry.id,
    type: entry.id === "typography" ? "registry:style" : "registry:ui",
    title: entry.name,
    description: entry.summary,
    seeds: [entry.paths.registry.source.path, ...optionalPaths(entry.paths.registry, "supportFiles")],
    primary: [entry.paths.registry.source.path],
  }));
}

function blockDefinitions(): Definition[] {
  return blockEntries.map<Definition>((entry) => ({
    id: entry.registryKind,
    type: "registry:block",
    title: entry.name,
    description: entry.summary,
    seeds: [entry.paths.files[0].path],
    primary: [entry.paths.files[0].path],
  }));
}

function extensionDefinitions(): Definition[] {
  return extensionEntries.map<Definition>((entry) => ({
    id: entry.registryKind,
    type: "registry:style",
    title: entry.name,
    description: entry.summary,
    seeds: [entry.source.path, ...optionalPaths(entry, "supportFiles")],
    primary: [entry.source.path],
  }));
}

function skinDefinitions(): Definition[] {
  return skinMetas.flatMap<Definition>((skin) => {
    if (!("paths" in skin) || !("packManifestPath" in skin)) return [];
    return [
      {
        id: `skin-${skin.id}`,
        type: skin.kind === "theme" ? "registry:theme" : "registry:style",
        title: `${skin.label} skin`,
        description: skin.description,
        docs: "docs" in skin ? skin.docs : undefined,
        seeds: skin.paths.map(sourcePath),
        primary: skin.paths.map(sourcePath),
        sourceManifestPath: skin.packManifestPath,
      },
    ];
  });
}

const completeComponentSet = [
  ...new Set([
    ...componentEntries.map((entry) => entry.registryKind),
    ...blockEntries.map((entry) => entry.registryKind),
    ...primitiveEntries.map((entry) => entry.paths.registry.registryKind),
  ]),
].sort();

function definitions(): Definition[] {
  const components = componentDefinitions();
  const fullInstallDefinitions = skinMetas.flatMap<Definition>((skin) => {
    if (!("packManifestPath" in skin)) return [];
    return [
      {
        id: `all-${skin.id}`,
        type: "registry:item",
        title: `All Control UI components — ${skin.label}`,
        description: `Every Control UI agent component, block, and primitive with the ${skin.label} skin.`,
        seeds: [],
        primary: [],
        dependencies: [...completeComponentSet, `skin-${skin.id}`],
        css: {
          '@import "../components/control-ui/styles/theme.css"': {},
          '@import "../components/control-ui/styles/effects.css"': {},
          '@import "../components/control-ui/styles/skin-theme.css"': {},
          '@import "../components/control-ui/styles/skin.css"': {},
        },
      },
    ];
  });

  return [
    {
      id: "core",
      type: "registry:base",
      title: "Control UI core",
      description: "Shared contracts, skin resolver, utilities, token bindings, and invariant mechanics for Control UI.",
      seeds: [...coreFiles],
      primary: [...coreFiles],
      internal: true,
    },
    ...components,
    ...primitiveDefinitions(),
    ...blockDefinitions(),
    ...extensionDefinitions(),
    ...internalDefinitions,
    ...fullInstallDefinitions,
    {
      id: "all",
      type: "registry:item",
      title: "All Control UI components",
      description: "Alias for the complete Control UI component set with the Refined skin.",
      seeds: [],
      primary: [],
      dependencies: ["all-refined"],
    },
    {
      id: "next-app",
      type: "registry:item",
      title: "Control UI Next.js app",
      description: "Minimal Next.js starter wiring for the complete Control UI registry.",
      seeds: ["src/registry/starters/next/layout.tsx", "src/registry/starters/next/page.tsx"],
      primary: ["src/registry/starters/next/layout.tsx", "src/registry/starters/next/page.tsx"],
      dependencies: ["all"],
    },
    {
      id: "chat",
      type: "registry:block",
      title: "Chat agents",
      description: "Runtime-agnostic chat components installed as a complete agent surface.",
      seeds: [],
      primary: [],
      dependencies: [
        "chat-message",
        "chat-composer",
        "chat-composer-attachment",
        "activity",
        "source-badge",
        "action-bar",
        "inline-attachment",
        "markdown-block",
        "code-block-editor",
        "chat-layout",
        "thread-rail",
        "model-switcher",
      ],
    },
    ...skinDefinitions(),
  ];
}

function sourceManifestPath(item: Definition) {
  if (item.sourceManifestPath) return item.sourceManifestPath;
  return `registry/${siteConfig.registry.name}/${item.id}.json`;
}

const directSourceTargets = new Map([
  ["src/registry/contracts.ts", `${componentRoot}/contracts.ts`],
  ["src/registry/skin.ts", `${componentRoot}/skin.ts`],
  ["src/registry/examples/control-ui/primitives/type-scale.css", `${componentRoot}/styles/type-scale.css`],
  ["src/registry/starters/next/layout.tsx", "~/app/layout.tsx"],
  ["src/registry/starters/next/page.tsx", "~/app/page.tsx"],
]);

const sourceTargetRoots = [
  ["src/registry/hooks/", `${componentRoot}/hooks/`],
  ["src/registry/lib/", `${componentRoot}/lib/`],
  ["src/registry/blocks/control-ui/", `${componentRoot}/blocks/`],
  ["src/registry/blocks/", `${componentRoot}/blocks/`],
  ["src/registry/sources/control-ui/ui/", `${componentRoot}/ui/`],
  ["src/registry/sources/control-ui/extensions/", `${componentRoot}/extensions/`],
  ["src/registry/sources/control-ui/", `${componentRoot}/`],
] as const;

const skinPackTargets = new Map([
  ["skin.config.tsx", `${componentRoot}/skin.config.tsx`],
  ["theme.css", `${componentRoot}/styles/skin-theme.css`],
  ["skin.css", `${componentRoot}/styles/skin.css`],
]);

function skinPackTarget(filePath: string) {
  const basename = path.basename(filePath);
  return skinPackTargets.get(basename) ?? `${componentRoot}/${basename}`;
}

function rootedSourceTarget(filePath: string) {
  for (const [sourceRoot, targetRoot] of sourceTargetRoots) {
    if (!filePath.startsWith(sourceRoot)) continue;
    const relative = filePath.slice(sourceRoot.length);
    if (relative.endsWith(".css")) return `${componentRoot}/styles/${path.basename(relative)}`;
    return `${targetRoot}${relative}`;
  }
  return undefined;
}

function sourceToTarget(filePath: string): string {
  const directTarget = directSourceTargets.get(filePath);
  if (directTarget) return directTarget;
  if (filePath.startsWith("src/registry/skin-packs/")) return skinPackTarget(filePath);

  const rootedTarget = rootedSourceTarget(filePath);
  if (rootedTarget) return rootedTarget;

  throw new Error(`No install target for ${filePath}`);
}

function fileType(filePath: string): RegistryFileType {
  if (filePath.startsWith("src/registry/starters/")) return "registry:page";
  if (filePath.endsWith(".css")) return "registry:file";
  if (filePath.endsWith("skin.config.tsx") || filePath.endsWith("modern-apple-liquid-glass.ts")) return "registry:lib";
  if (filePath.includes("/blocks/")) return "registry:block";
  if (filePath.includes("/hooks/")) return "registry:hook";
  if (filePath.includes("/lib/") || filePath.endsWith("contracts.ts") || filePath.endsWith("skin.ts")) return "registry:lib";
  if (filePath.includes("/ui/")) return "registry:ui";
  return "registry:component";
}

function walk(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = path.join(directory, entry);
    return statSync(fullPath).isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function registrySources() {
  return walk(path.join(root, "src/registry"))
    .filter((filePath) => /\.(css|ts|tsx)$/.test(filePath) && !filePath.includes(".test."))
    .map((filePath) => path.relative(root, filePath));
}

function sourceImportSpecifiers(filePath: string) {
  if (!/\.(ts|tsx)$/.test(filePath)) return [];
  const source = readFileSync(path.join(root, filePath), "utf8");
  return importSpecifiers(filePath, source);
}

function packageName(specifier: string) {
  if (specifier.startsWith("@")) return specifier.split("/").slice(0, 2).join("/");
  return specifier.split("/")[0];
}

function dependencySpecifier(name: string) {
  const version = packageVersions[name];
  return version ? `${name}@${version}` : name;
}

function resolveRelativeSource(importer: string, specifier: string, allSources: Set<string>) {
  const base = path.posix.normalize(path.posix.join(path.posix.dirname(importer), specifier));
  return [base, `${base}.ts`, `${base}.tsx`, `${base}.css`, `${base}/index.ts`, `${base}/index.tsx`].find((candidate) =>
    allSources.has(candidate),
  );
}

function resolveAliasSource(specifier: string, sourceByTarget: Map<string, string>) {
  const prefix = `@/components/${siteConfig.registry.name}/`;
  if (!specifier.startsWith(prefix)) return undefined;
  const base = `${componentRoot}/${specifier.slice(prefix.length)}`;
  return [base, `${base}.ts`, `${base}.tsx`, `${base}.css`, `${base}/index.ts`, `${base}/index.tsx`]
    .map((target) => sourceByTarget.get(target))
    .find(Boolean);
}

function isHostOwnedPackageImport(source: string, specifier: string) {
  if (specifier.startsWith("@/") || specifier.startsWith("node:")) return true;
  if (specifier === "react" || specifier === "react-dom") return true;
  return hostOwnedPackageImports.has(`${source}::${specifier}`);
}

function registryDocs(files: RegistrySourceFile[]) {
  const styles = [
    ...new Set(
      files.filter((file) => file.target.includes("/styles/")).map((file) => file.target.replace("@components/", "../components/")),
    ),
  ].sort((left, right) => {
    const order = ["theme.css", "effects.css", "skin-theme.css", "skin.css"];
    const leftRank = order.indexOf(path.basename(left));
    const rightRank = order.indexOf(path.basename(right));
    return (leftRank === -1 ? order.length : leftRank) - (rightRank === -1 ? order.length : rightRank) || left.localeCompare(right);
  });
  if (styles.length === 0) return undefined;
  return `Add these imports once to app/globals.css: ${styles.map((style) => `@import "${style}";`).join(" ")}`;
}

type RegistryBuildContext = {
  allSources: Set<string>;
  sourceByTarget: Map<string, string>;
  ownerBySource: Map<string, string>;
};

function importedDependencies(definitionId: string, source: string, context: RegistryBuildContext) {
  const sources: string[] = [];
  const packages: string[] = [];

  for (const specifier of sourceImportSpecifiers(source)) {
    if (specifier.startsWith(".")) {
      const dependencySource = resolveRelativeSource(source, specifier, context.allSources);
      if (!dependencySource && hostOwnedRelativeImports.has(`${source}::${specifier}`)) continue;
      if (!dependencySource) throw new Error(`${definitionId}: cannot resolve ${specifier} from ${source}`);
      sources.push(dependencySource);
      continue;
    }

    const aliasSource = resolveAliasSource(specifier, context.sourceByTarget);
    if (aliasSource) {
      sources.push(aliasSource);
      continue;
    }

    if (isHostOwnedPackageImport(source, specifier)) continue;
    packages.push(dependencySpecifier(packageName(specifier)));
  }

  return { sources, packages };
}

function collectDefinitionSources(definition: Definition, context: RegistryBuildContext) {
  const owned = new Set<string>();
  const registryDependencies = new Set(definition.dependencies ?? []);
  const npmDependencies = new Set<string>();
  const queue = [...definition.seeds];

  while (queue.length > 0) {
    const source = queue.shift();
    if (!source || owned.has(source)) continue;
    if (!existsSync(path.join(root, source))) throw new Error(`${definition.id} references missing ${source}`);

    const owner = context.ownerBySource.get(source);
    if (owner && owner !== definition.id) {
      registryDependencies.add(owner);
      continue;
    }

    owned.add(source);
    context.ownerBySource.set(source, definition.id);

    const imports = importedDependencies(definition.id, source, context);
    queue.push(
      ...imports.sources.filter(
        (importedSource) => source !== activeSkinConfigPeer.importer || importedSource !== activeSkinConfigPeer.source,
      ),
    );
    for (const packageDependency of imports.packages) npmDependencies.add(packageDependency);
  }

  return { owned, registryDependencies, npmDependencies };
}

function createRegistryItem(definition: Definition, context: RegistryBuildContext): RegistrySourceItem {
  const { owned, registryDependencies, npmDependencies } = collectDefinitionSources(definition, context);

  if (definition.id !== "core" && [...owned].some((source) => includesString(coreFiles, source))) {
    throw new Error(`${definition.id} owns a core file`);
  }
  if (definition.id !== "core") registryDependencies.add("core");

  const files = [...owned]
    .sort()
    .map<RegistrySourceFile>((source) => ({ path: source, target: sourceToTarget(source), type: fileType(source) }));

  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: definition.id,
    type: definition.type,
    title: definition.title,
    description: definition.description,
    docs: definition.docs ?? registryDocs(files),
    dependencies: [...npmDependencies].sort(),
    registryDependencies: [...registryDependencies].filter((id) => id !== definition.id).sort(),
    files,
    css: definition.css,
    meta: {
      internal: definition.internal || undefined,
      sourceManifestPath: sourceManifestPath(definition),
    },
  };
}

function assertUniqueDefinitionIds(items: Definition[]) {
  const ids = new Set(items.map((item) => item.id));
  if (ids.size !== items.length) throw new Error("Registry item ids must be unique");
}

function registryBuildSources() {
  const allSources = new Set(registrySources());
  allSources.add("src/registry/examples/control-ui/primitives/type-scale.css");
  return allSources;
}

function createSourceTargetLookup(allSources: Set<string>) {
  const sourceByTarget = new Map<string, string>();
  for (const source of allSources) {
    try {
      sourceByTarget.set(sourceToTarget(source), source);
    } catch {
      // Docs examples and tests are not installable registry sources.
    }
  }
  return sourceByTarget;
}

function createSourceOwners(items: Definition[]) {
  const ownerBySource = new Map<string, string>();
  for (const item of items) {
    for (const source of item.primary) {
      const current = ownerBySource.get(source);
      if (current && current !== item.id) throw new Error(`${source} is primary for both ${current} and ${item.id}`);
      ownerBySource.set(source, item.id);
    }
  }

  for (const item of items) {
    for (const source of item.seeds) {
      if (!ownerBySource.has(source)) ownerBySource.set(source, item.id);
    }
  }
  return ownerBySource;
}

function assertKnownRegistryDependencies(output: RegistrySourceItem[]) {
  const knownIds = new Set(output.map((item) => item.name));
  for (const item of output) {
    for (const dependency of item.registryDependencies) {
      if (!knownIds.has(dependency)) throw new Error(`${item.name} depends on unknown registry item ${dependency}`);
    }
  }
}

function activeTargetsOwnedBy(item: RegistrySourceItem, activeTargets: Set<string>) {
  return item.files.filter((file) => activeTargets.has(file.target)).map((file) => file.target);
}

function assertSkinOwnership(item: RegistrySourceItem, activeTargets: Set<string>) {
  const ownedTargets = activeTargetsOwnedBy(item, activeTargets);
  const missingTargets = [...activeTargets].filter((target) => !ownedTargets.includes(target));
  if (missingTargets.length > 0) throw new Error(`${item.name} is missing active skin targets: ${missingTargets.join(", ")}`);
  if (ownedTargets.length !== activeTargets.size) throw new Error(`${item.name} must own each active skin target exactly once`);
  if (!item.registryDependencies.includes("core")) throw new Error(`${item.name} must depend on core`);
  if (item.registryDependencies.some((dependency) => dependency.startsWith("skin-"))) {
    throw new Error(`${item.name} must not depend on another skin`);
  }
}

function assertActiveSkinOwnership(output: RegistrySourceItem[]) {
  const activeTargets = new Set(skinPackTargets.values());
  const core = output.find((item) => item.name === "core");
  if (!core) throw new Error("Registry is missing core");
  if (activeTargetsOwnedBy(core, activeTargets).length > 0) throw new Error("core owns an active skin target");
  if (core.registryDependencies.some((dependency) => dependency.startsWith("skin-"))) throw new Error("core must not depend on a skin");

  for (const item of output) {
    if (item.name.startsWith("skin-")) {
      assertSkinOwnership(item, activeTargets);
    } else if (activeTargetsOwnedBy(item, activeTargets).length > 0) {
      throw new Error(`${item.name} owns an active skin target`);
    }
  }
}

function assertFullInstallInvariance(output: RegistrySourceItem[]) {
  const expectedBundleIds = skinMetas
    .filter((skin) => "packManifestPath" in skin)
    .map((skin) => `all-${skin.id}`)
    .sort();
  const bundles = output.filter((item) => item.name.startsWith("all-")).sort((left, right) => left.name.localeCompare(right.name));
  if (bundles.map((item) => item.name).join("\n") !== expectedBundleIds.join("\n")) {
    throw new Error("Full-install manifests do not cover every installable skin exactly once");
  }

  const expectedComponents = completeComponentSet.join("\n");
  for (const bundle of bundles) {
    const skinId = bundle.name.slice("all-".length);
    const skinDependencies = bundle.registryDependencies.filter((dependency) => dependency.startsWith("skin-"));
    if (skinDependencies.length !== 1 || skinDependencies[0] !== `skin-${skinId}`) {
      throw new Error(`${bundle.name} must select exactly skin-${skinId}`);
    }
    const componentDependencies = bundle.registryDependencies
      .filter((dependency) => dependency !== "core" && !dependency.startsWith("skin-"))
      .sort()
      .join("\n");
    if (componentDependencies !== expectedComponents) {
      throw new Error(`${bundle.name} does not install the canonical component set`);
    }
    if (bundle.files.length > 0) throw new Error(`${bundle.name} must compose canonical registry items instead of owning source files`);
  }
}

export function createRegistryItems(): RegistrySourceItem[] {
  const items = definitions();
  assertUniqueDefinitionIds(items);

  const allSources = registryBuildSources();
  const context = {
    allSources,
    sourceByTarget: createSourceTargetLookup(allSources),
    ownerBySource: createSourceOwners(items),
  } satisfies RegistryBuildContext;
  const output = items.map((definition) => createRegistryItem(definition, context));
  assertKnownRegistryDependencies(output);
  assertActiveSkinOwnership(output);
  assertFullInstallInvariance(output);

  return output.sort((a, b) => a.name.localeCompare(b.name));
}

export function publicRegistryUrl(id: string) {
  return `${env.NEXT_PUBLIC_REGISTRY_URL}/r/${id}.json`;
}

export function publicRegistryDependency(id: string) {
  return publicRegistryUrl(id);
}
