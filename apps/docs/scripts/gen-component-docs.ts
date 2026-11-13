// Run with `--conditions react-server`: the anatomy slice reads the server-only skin contract.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getDocsData } from "@/app/(features)/model/data";
import { registryInstallCommand } from "@/app/(features)/model/registry";
import type { Composition, DocsKnobFamily, RegistryKindId, SourceFile } from "@/app/(features)/model/types";
import { anatomyFor } from "@/app/(features)/registry-api/api";
import { env } from "@/env";
import { absoluteSiteUrl, siteConfig } from "@/lib/site-config";
import {
  type ComponentDocInput,
  type ComponentDocModule,
  componentDocMarkdown,
  componentDocsDir,
  isComponentDocSource,
} from "./component-docs";
import { exportedBindings } from "./module-imports";
import { contractSlicePath, contractSliceUrl } from "./public-payloads";
import { createRegistryItems, type RegistrySourceItem } from "./registry-model";

const checkOnly = process.argv.includes("--check");
const root = process.cwd();
const componentRoot = `${siteConfig.registry.componentRoot}/`;
const installedAlias = `@/components/${siteConfig.registry.name}/`;

type DocumentedItem = {
  registryKind: RegistryKindId;
  name: string;
  summary: string;
  status?: string;
  href: string;
  example: SourceFile;
  composition?: Composition;
  knobs: DocsKnobFamily[];
};

function documentedItems() {
  const data = getDocsData();
  const items: DocumentedItem[] = [
    ...data.components.map((component) => ({
      registryKind: component.registry.registryKind,
      name: component.name,
      summary: component.summary,
      status: component.status,
      href: `/components/${component.id}`,
      example: component.registry.example,
      composition: component.registry.composition,
      knobs: component.registry.knobs,
    })),
    ...data.kits.flatMap((kit) => [
      {
        registryKind: kit.registryKind,
        name: kit.name,
        summary: kit.summary,
        status: kit.status,
        href: `/kits/${kit.id}`,
        example: kit.example,
        composition: kit.composition,
        knobs: kit.knobs,
      },
      ...(kit.alternatives ?? [])
        .filter((alternative) => alternative.registryKind !== kit.registryKind)
        .map((alternative) => ({
          registryKind: alternative.registryKind,
          name: `${kit.name} — ${alternative.label}`,
          summary: alternative.description,
          status: kit.status,
          href: `/kits/${kit.id}?alternative=${alternative.id}`,
          example: alternative.example,
          knobs: alternative.knobs,
        })),
    ]),
    ...data.blocks.map((block) => ({
      registryKind: block.registryKind,
      name: block.name,
      summary: block.summary,
      status: block.status,
      href: `/templates/${block.id}`,
      example: block.example,
      composition: block.composition,
      knobs: [],
    })),
  ];
  return new Map<string, DocumentedItem>(items.map((item) => [item.registryKind, item]));
}

function exportedModules(item: RegistrySourceItem): ComponentDocModule[] {
  return item.files.flatMap((file) => {
    if (!/\.tsx?$/.test(file.path) || !file.target.startsWith(componentRoot)) return [];
    const bindings = exportedBindings(file.path, readFileSync(path.join(root, file.path), "utf8"));
    if (bindings.length === 0) return [];
    return [
      {
        specifier: `${installedAlias}${file.target.slice(componentRoot.length).replace(/\.tsx?$/, "")}`,
        values: bindings.filter((binding) => !binding.typeOnly).map((binding) => binding.name),
        types: bindings.filter((binding) => binding.typeOnly).map((binding) => binding.name),
      },
    ];
  });
}

function contractUrls(scopes: NonNullable<ComponentDocInput["anatomy"]>["scopes"]) {
  const families = new Set(
    Object.entries(scopes).flatMap(([scopeName, scope]) => Object.values(scope.parts).map((part) => part.family ?? scopeName)),
  );
  return [...families]
    .filter((family) => existsSync(path.join(root, contractSlicePath(family))))
    .sort()
    .map((family) => `${env.NEXT_PUBLIC_REGISTRY_URL}${contractSliceUrl(family)}`);
}

function docInput(item: RegistrySourceItem, documented: DocumentedItem): ComponentDocInput {
  const anatomy = anatomyFor(item.name);
  const scopes = anatomy?.ownScopes ?? {};
  return {
    id: item.name,
    name: documented.name,
    summary: documented.summary,
    status: documented.status,
    pageUrl: absoluteSiteUrl(documented.href),
    install: [registryInstallCommand(documented.registryKind)],
    npmImportNote: `With \`${siteConfig.npmPackage}\` instead of the registry, import from \`${siteConfig.npmPackage}/\` where this file says \`${installedAlias}\`; this file then lives at \`node_modules/${siteConfig.npmPackage}/dist/docs/${item.name}.md\`.`,
    dependencies: item.dependencies,
    registryDependencies: item.registryDependencies,
    modules: exportedModules(item),
    compositions: documented.composition ?? [],
    example: documented.example.code,
    anatomy: anatomy && { selectorPattern: anatomy.selectorPattern, scopes },
    knobs: documented.knobs,
    contractUrls: contractUrls(scopes),
  };
}

const documentedById = documentedItems();
const expected = new Map<string, string>();
for (const item of createRegistryItems()) {
  for (const file of item.files) {
    if (!isComponentDocSource(file.path)) continue;
    const entry = documentedById.get(item.name);
    if (!entry) throw new Error(`${item.name} ships ${file.path} but has no catalog entry to document`);
    expected.set(file.path, componentDocMarkdown(docInput(item, entry)));
  }
}

const failures: string[] = [];
const docsRoot = path.join(root, componentDocsDir);
mkdirSync(docsRoot, { recursive: true });

for (const [source, content] of expected) {
  const absolutePath = path.join(root, source);
  if (existsSync(absolutePath) && readFileSync(absolutePath, "utf8") === content) continue;
  if (checkOnly) failures.push(`${source} is out of date`);
  else writeFileSync(absolutePath, content);
}

for (const entry of readdirSync(docsRoot)) {
  const source = `${componentDocsDir}/${entry}`;
  if (expected.has(source)) continue;
  if (checkOnly) failures.push(`${source} is stale`);
  else rmSync(path.join(root, source));
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}; run \`bun run sync:component-docs\``).join("\n"));
  process.exit(1);
}

console.log(checkOnly ? `Component docs are in sync (${expected.size} files).` : `Component docs synced (${expected.size} files).`);
