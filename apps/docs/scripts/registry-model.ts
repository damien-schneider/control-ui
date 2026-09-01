import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import type { RegistryItem } from "shadcn/schema";
import { blockEntries } from "@/app/(features)/catalog/blocks";
import { componentEntries } from "@/app/(features)/catalog/components";
import { extensionEntries } from "@/app/(features)/catalog/extensions";
import { primitiveEntries } from "@/app/(features)/catalog/primitives";
import { includesString } from "@/app/(features)/catalog/shared";
import { skinMetas } from "@/app/(features)/catalog/skins";
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
const recipeSourceRoot = "src/registry/sources/control-ui/recipes/";
const knobContractSourceRoot = "src/registry/knob-contracts/";

function isRecipeSource(source: string) {
  return source.startsWith(recipeSourceRoot);
}

function isKnobContractSource(source: string) {
  return source.startsWith(knobContractSourceRoot);
}

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
  "src/registry/skin.ts",
  "src/registry/lib/cn.ts",
  "src/registry/sources/control-ui/control-props.ts",
  "src/registry/sources/control-ui/control-variants.ts",
  "src/registry/sources/control-ui/theme.css",
  "src/registry/sources/control-ui/scripts/fix-css-imports.mjs",
  "src/registry/sources/control-ui/scripts/control-ui-doctor.mjs",
  "src/registry/sources/control-ui/scripts/contrast-eval.mjs",
] as const;

if (coreFiles.length !== 8) throw new Error(`Control UI core must contain exactly 8 files; received ${coreFiles.length}`);

const styleUtilitySource = "src/registry/sources/control-ui/effects.css";

const codeBySource = new Map<string, string>();

function sourceCode(source: string) {
  const cached = codeBySource.get(source);
  if (cached !== undefined) return cached;
  const code = readFileSync(path.join(root, source), "utf8").replaceAll(/\/\*[\s\S]*?\*\/|\/\/.*/g, " ");
  codeBySource.set(source, code);
  return code;
}

function styleUtilityNames(kind: "utility" | "keyframes") {
  return [...sourceCode(styleUtilitySource).matchAll(new RegExp(`@${kind}\\s+([\\w-]+)`, "g"))].map((match) => match[1]);
}

const styleUtilities = styleUtilityNames("utility");
const styleUtilityIdentifiers = [...styleUtilities, ...styleUtilityNames("keyframes")];

function referencedNames(candidates: string[], source: string) {
  if (source === styleUtilitySource) return [];
  const code = sourceCode(source);
  return candidates.filter((name) => new RegExp(`(^|[^\\w-])${name}([^\\w-]|$)`).test(code));
}

function referencedStyleUtilities(source: string) {
  return referencedNames(styleUtilities, source);
}

function usesStyleUtilities(sources: Iterable<string>) {
  return [...sources].some((source) => referencedNames(styleUtilityIdentifiers, source).length > 0);
}

const internalDefinitions: Definition[] = [
  {
    id: "control-ui-skill",
    type: "registry:item",
    title: "Control UI agent skill",
    description:
      "The Control UI working rules and token contract, installed to .claude/skills/control-ui/SKILL.md so agent sessions in the repository build with the library unprompted.",
    seeds: ["src/registry/skills/control-ui-skill.md"],
    primary: ["src/registry/skills/control-ui-skill.md"],
    internal: true,
  },
  {
    id: "effects",
    type: "registry:style",
    title: "Control UI effects",
    description: "Token-driven shimmer, halftone, and sweep utilities shared by the components that use them.",
    seeds: [styleUtilitySource],
    primary: [styleUtilitySource],
    internal: true,
  },
  {
    id: "surface-variants",
    type: "registry:item",
    title: "Surface variants",
    description: "Popup part names and surface variant resolution shared across popup-family components.",
    seeds: ["src/registry/sources/control-ui/surface-variants.ts"],
    primary: ["src/registry/sources/control-ui/surface-variants.ts"],
    internal: true,
  },
  {
    id: "use-copy-to-clipboard",
    type: "registry:item",
    title: "useCopyToClipboard",
    description: "Clipboard write with a self-resetting copied flag.",
    seeds: ["src/registry/hooks/use-copy-to-clipboard.ts"],
    primary: ["src/registry/hooks/use-copy-to-clipboard.ts"],
    internal: true,
  },
  {
    id: "breadcrumb",
    type: "registry:ui",
    title: "Breadcrumb",
    description: "Semantic breadcrumb styled with Control UI tokens.",
    seeds: ["src/registry/sources/control-ui/ui/breadcrumb.tsx", "src/registry/sources/control-ui/recipes/breadcrumb.css"],
    primary: ["src/registry/sources/control-ui/ui/breadcrumb.tsx"],
    internal: true,
  },
  {
    id: "label",
    type: "registry:ui",
    title: "Label",
    description: "Accessible form label used by composed controls.",
    seeds: ["src/registry/sources/control-ui/ui/label.tsx", "src/registry/sources/control-ui/recipes/label.css"],
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
    seeds: ["src/registry/sources/control-ui/ui/separator.tsx", "src/registry/sources/control-ui/recipes/separator.css"],
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
      "src/registry/sources/control-ui/recipes/track-highlight.css",
    ],
    primary: ["src/registry/sources/control-ui/extensions/track-highlight.tsx"],
    internal: true,
  },
];

function sourcePath(file: { path: string }) {
  return file.path;
}

// `source` anchors parameter: supportFiles-only shape would be weak type and reject every
// catalog entry that declares no support files.
function supportFilePaths(entry: { source: { path: string }; supportFiles?: readonly { path: string }[] }): string[] {
  return entry.supportFiles?.map(sourcePath) ?? [];
}

function componentDefinitions(): Definition[] {
  const components = componentEntries.map<Definition>((entry) => {
    const files = [entry.paths.source.path];
    if ("hook" in entry.paths) files.push(entry.paths.hook.path);
    files.push(...supportFilePaths(entry.paths));
    return {
      id: entry.id,
      type: "registry:component",
      title: entry.name,
      description: entry.summary,
      seeds: files,
      primary: [entry.paths.source.path],
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
    seeds: [entry.paths.registry.source.path, ...supportFilePaths(entry.paths.registry)],
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
    seeds: [entry.source.path, ...supportFilePaths(entry)],
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
    "control-ui-skill",
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
      docs: `Components compile once a skin pack is installed (it creates skin.config.tsx). Pick one at ${siteConfig.url.origin}/skins, e.g.: npx shadcn@latest add ${siteConfig.url.origin}/r/skin-refined.json --overwrite`,
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
      id: "update",
      type: "registry:item",
      title: "Control UI update",
      description:
        "The complete component set without any skin; re-run with --overwrite to refresh installed sources while keeping the active skin untouched.",
      seeds: [],
      primary: [],
      dependencies: [...completeComponentSet],
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
        "inline-citation",
        "source-badge",
        "action-bar",
        "inline-attachment",
        "markdown-block",
        "code-block-editor",
        "chat-layout",
        "thread-rail",
        "transcript-divider",
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
  ["src/registry/skin.ts", `${componentRoot}/skin.ts`],
  ["src/registry/examples/control-ui/primitives/type-scale.css", `${componentRoot}/styles/type-scale.css`],
  ["src/registry/skills/control-ui-skill.md", "~/.claude/skills/control-ui/SKILL.md"],
  ["src/registry/starters/next/layout.tsx", "~/app/layout.tsx"],
  ["src/registry/starters/next/page.tsx", "~/app/page.tsx"],
]);

const sourceTargetRoots = [
  ["src/registry/knob-contracts/", `${componentRoot}/knob-contracts/`],
  ["src/registry/hooks/", `${componentRoot}/hooks/`],
  ["src/registry/lib/", `${componentRoot}/lib/`],
  ["src/registry/blocks/control-ui/", `${componentRoot}/blocks/`],
  ["src/registry/blocks/", `${componentRoot}/blocks/`],
  ["src/registry/sources/control-ui/ui/", `${componentRoot}/ui/`],
  ["src/registry/sources/control-ui/extensions/", `${componentRoot}/extensions/`],
  ["src/registry/sources/control-ui/recipes/", `${componentRoot}/styles/recipes/`],
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
    if (relative.endsWith(".css") && !targetRoot.includes("/styles/")) return `${componentRoot}/styles/${path.basename(relative)}`;
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
  if (filePath.endsWith(".css") || filePath.endsWith(".mjs") || filePath.endsWith(".md")) return "registry:file";
  if (filePath.endsWith("skin.config.tsx") || filePath.endsWith("modern-apple-liquid-glass.ts")) return "registry:lib";
  if (filePath.includes("/blocks/")) return "registry:block";
  if (filePath.includes("/hooks/")) return "registry:hook";
  if (filePath.includes("/lib/") || filePath.endsWith("skin.ts")) return "registry:lib";
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

function registryCss(files: RegistrySourceFile[]): RegistryItem["css"] | undefined {
  const styles = [
    ...new Set(
      files.filter((file) => file.target.includes("/styles/")).map((file) => file.target.replace("@components/", "../components/")),
    ),
  ].sort((left, right) => {
    const order = ["theme.css", "effects.css", "skin-theme.css", "skin.css"];
    const leftName = path.basename(left);
    const rightName = path.basename(right);
    const leftRank = order.indexOf(leftName);
    const rightRank = order.indexOf(rightName);
    const rank = (leftRank === -1 ? order.length : leftRank) - (rightRank === -1 ? order.length : rightRank);
    if (rank !== 0) return rank;
    if (rightName.startsWith(`${leftName.slice(0, -4)}-`)) return -1;
    if (leftName.startsWith(`${rightName.slice(0, -4)}-`)) return 1;
    return 0;
  });
  if (styles.length === 0) return undefined;
  return Object.fromEntries(styles.map((style) => [`@import "${style}"`, {}]));
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
  const queue = definition.seeds.filter((source) => !isRecipeSource(source));

  while (queue.length > 0) {
    const source = queue.shift();
    if (!source || owned.has(source)) continue;
    if (!existsSync(path.join(root, source))) throw new Error(`${definition.id} references missing ${source}`);

    if (isKnobContractSource(source)) {
      owned.add(source);
      continue;
    }

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
  const sources = new Set([...owned, ...definition.seeds.filter(isRecipeSource)]);

  if (definition.id !== "core" && [...sources].some((source) => includesString(coreFiles, source))) {
    throw new Error(`${definition.id} owns a core file`);
  }
  if (definition.id !== "core") registryDependencies.add("core");
  if (definition.id !== "effects" && usesStyleUtilities(sources)) registryDependencies.add("effects");

  const files = [...sources]
    .sort()
    .map<RegistrySourceFile>((source) => ({ path: source, target: sourceToTarget(source), type: fileType(source) }));

  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: definition.id,
    type: definition.type,
    title: definition.title,
    description: definition.description,
    docs: definition.docs,
    dependencies: [...npmDependencies].sort(),
    registryDependencies: [...registryDependencies].filter((id) => id !== definition.id).sort(),
    files,
    css: definition.css ?? registryCss(files),
    meta: {
      ...(definition.internal && { internal: true }),
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

function assignPrimarySourceOwners(ownerBySource: Map<string, string>, item: Definition) {
  for (const source of item.primary) {
    const current = ownerBySource.get(source);
    if (current && current !== item.id) throw new Error(`${source} is primary for both ${current} and ${item.id}`);
    ownerBySource.set(source, item.id);
  }
}

function assignSeedSourceOwners(ownerBySource: Map<string, string>, item: Definition) {
  for (const source of item.seeds) {
    if (!isRecipeSource(source) && !ownerBySource.has(source)) ownerBySource.set(source, item.id);
  }
}

function createSourceOwners(items: Definition[]) {
  const ownerBySource = new Map<string, string>();
  for (const item of items) assignPrimarySourceOwners(ownerBySource, item);
  for (const item of items) assignSeedSourceOwners(ownerBySource, item);
  return ownerBySource;
}

function assertUniqueModuleBasenames(output: RegistrySourceItem[]) {
  for (const item of output) {
    const ownerByBasename = new Map<string, string>();
    for (const file of item.files) {
      if (!/\.tsx?$/.test(file.path)) continue;
      const basename = path.basename(file.path).replace(/\.tsx?$/, "");
      const twin = ownerByBasename.get(basename);
      if (twin) {
        throw new Error(`${item.name} ships ${twin} and ${file.path}; the CLI rewrites imports by basename and would repoint them`);
      }
      ownerByBasename.set(basename, file.path);
    }
  }
}

function assertStyleUtilitiesAreUsed(output: RegistrySourceItem[]) {
  const used = new Set(
    output.flatMap((item) => (item.name === "effects" ? [] : item.files.flatMap((file) => referencedStyleUtilities(file.path)))),
  );
  const unused = styleUtilities.filter((name) => !used.has(name));
  if (unused.length > 0) throw new Error(`${styleUtilitySource} defines unused utilities: ${unused.join(", ")}`);
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

function assertDefinitionRecipes(definition: Definition, item: RegistrySourceItem, attachedRecipes: Set<string>) {
  for (const recipe of definition.seeds.filter(isRecipeSource)) {
    attachedRecipes.add(recipe);
    const target = sourceToTarget(recipe);
    if (!item.files.some((file) => file.path === recipe && file.target === target)) {
      throw new Error(`${definition.id} does not ship attached recipe ${recipe}`);
    }
    const importKey = `@import "${target.replace("@components/", "../components/")}"`;
    if (!item.css || !(importKey in item.css)) {
      throw new Error(`${definition.id} does not import attached recipe ${recipe}`);
    }
  }
}

function assertRecipeAttachments(items: Definition[], output: RegistrySourceItem[], ownerBySource: Map<string, string>) {
  const attachedRecipes = new Set<string>();
  for (const definition of items) {
    if (!definition.seeds.some(isRecipeSource)) continue;
    const item = output.find((candidate) => candidate.name === definition.id);
    if (!item) throw new Error(`Registry output is missing ${definition.id}`);
    assertDefinitionRecipes(definition, item, attachedRecipes);
  }

  const recipes = readdirSync(path.join(root, "src/registry/sources/control-ui/recipes"))
    .filter((name) => name.endsWith(".css"))
    .map((name) => `${recipeSourceRoot}${name}`);
  const missing = recipes.filter((recipe) => !attachedRecipes.has(recipe));
  if (missing.length > 0) throw new Error(`Recipes are not attached to registry items: ${missing.join(", ")}`);
  const owned = [...ownerBySource.keys()].filter((source) => isRecipeSource(source) || isKnobContractSource(source));
  if (owned.length > 0) {
    throw new Error(`Paint contracts must not introduce registry dependencies: ${owned.join(", ")}`);
  }
}

export type RecipeSourceExpectation = {
  recipe: string;
  sources: string[];
};

export function createRecipeSourceExpectations(): RecipeSourceExpectation[] {
  return definitions().flatMap((definition) => {
    const sources = definition.primary.filter(
      (source) => source.startsWith("src/registry/sources/control-ui/") && /\.(?:ts|tsx)$/.test(source),
    );
    return definition.seeds.filter(isRecipeSource).map((recipe) => ({ recipe, sources }));
  });
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
  assertStyleUtilitiesAreUsed(output);
  assertUniqueModuleBasenames(output);
  assertActiveSkinOwnership(output);
  assertFullInstallInvariance(output);
  assertRecipeAttachments(items, output, context.ownerBySource);

  return output.sort((a, b) => a.name.localeCompare(b.name));
}

// Every generated public artifact — manifests, the agent index, the setup prompt — is published against the site
// origin, so a checkout serving a different registry URL cannot emit dependencies the published prompt cannot reach.
export function publicRegistryUrl(id: string) {
  return `${siteConfig.url.origin}/r/${id}.json`;
}

export function publicRegistryDependency(id: string) {
  return publicRegistryUrl(id);
}
