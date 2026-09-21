import { existsSync } from "node:fs";
import path from "node:path";
import { practiceSkills, skillConcerns } from "@control-ui/skills";
import { catalogEntries } from "../app/(features)/catalog";
import { blockEntries, useCaseKinds } from "../app/(features)/catalog/blocks";
import { catalogCategories } from "../app/(features)/catalog/categories";
import { componentEntries } from "../app/(features)/catalog/components";
import { extensionEntries } from "../app/(features)/catalog/extensions";
import { hookEntries, utilEntries } from "../app/(features)/catalog/hooks-utils";
import { primitiveEntries } from "../app/(features)/catalog/primitives";
import type { CatalogSourceFile } from "../app/(features)/catalog/shared";
import { skinMetas } from "../app/(features)/catalog/skins";
import { registryMetadata } from "../app/(features)/model/generated-registry";

const root = process.cwd();
const failures: string[] = [];
type PreviewWithLoad = { load: () => Promise<unknown> };

function expectedImportSpecifier(filePath: string) {
  return `@/${filePath.replace(/\.(ts|tsx)$/, "")}`;
}

function importSpecifiers(preview: PreviewWithLoad) {
  return [...preview.load.toString().matchAll(/import\(["'`](.*?)["'`]\)/g)].map((match) => match[1]);
}

function checkSourceFile(owner: string, file: CatalogSourceFile) {
  if (!existsSync(path.join(root, file.path))) {
    failures.push(`${owner} references missing ${file.path}`);
  }
}

function checkRecord(owner: string, record: Record<string, CatalogSourceFile>) {
  for (const [key, file] of Object.entries(record)) {
    checkSourceFile(`${owner}.${key}`, file);
  }
}

function checkPreview(owner: string, file: CatalogSourceFile, preview?: PreviewWithLoad, previewModule?: string) {
  if (!preview) {
    failures.push(`${owner} is missing a preview`);
    return;
  }

  if (previewModule && !existsSync(path.join(root, previewModule))) failures.push(`${owner} references missing ${previewModule}`);
  const expected = expectedImportSpecifier(previewModule ?? file.path);
  const imports = importSpecifiers(preview);

  if (!imports.includes(expected)) {
    failures.push(`${owner} preview imports ${imports.join(", ") || "nothing"}; expected ${expected}`);
  }
}

const ids = new Map<string, string>();

for (const entry of catalogEntries) {
  const existing = ids.get(entry.id);
  if (existing) {
    failures.push(`${entry.kind} "${entry.id}" duplicates ${existing}`);
  }
  ids.set(entry.id, entry.kind);
}

for (const skill of practiceSkills) {
  const existing = ids.get(skill.id);
  if (existing) {
    failures.push(`Skill "${skill.id}" duplicates ${existing}`);
  }
  ids.set(skill.id, "Skill");
}

const skillConcernIds = new Set(skillConcerns.map((concern) => concern.id));

for (const skill of practiceSkills) {
  if (!skillConcernIds.has(skill.concern)) {
    failures.push(`Skill "${skill.id}" references unknown concern "${skill.concern}"`);
  }
}

const categoryIds = new Set<string>(catalogCategories.map((category) => category.id));
const usedCategoryIds = new Set<string>();
const registryIds = new Set<string>(Object.keys(registryMetadata));

if (categoryIds.size !== catalogCategories.length) {
  failures.push("Catalog categories contain duplicate ids");
}

// One nav group now mixes both tiers, so a shared id collapses two links onto one key and one active page.
const primitiveIds = new Set<string>(primitiveEntries.map((entry) => entry.id));

for (const component of componentEntries) {
  if (primitiveIds.has(component.id)) {
    failures.push(`Id "${component.id}" is claimed by both a component and a primitive`);
  }
}

function checkRegistryItem(owner: string, id: string) {
  if (!registryIds.has(id)) failures.push(`${owner} references missing registry item "${id}"`);
}

for (const entry of componentEntries) {
  if (!categoryIds.has(entry.category)) {
    failures.push(`${entry.id} references unknown category "${entry.category}"`);
  }
  usedCategoryIds.add(entry.category);
  checkRegistryItem(entry.id, entry.registryKind);
  checkSourceFile(`${entry.id}.example`, entry.paths.example);
  checkRecord(`${entry.id}.usage`, entry.paths.usage);
  checkSourceFile(`${entry.id}.source`, entry.paths.source);
  if ("hook" in entry.paths) checkSourceFile(`${entry.id}.hook`, entry.paths.hook);
  if ("supportFiles" in entry.paths) {
    for (const file of entry.paths.supportFiles) checkSourceFile(`${entry.id}.supportFiles`, file);
  }

  checkPreview(entry.id, entry.paths.example, entry.preview, "previewModule" in entry.paths ? entry.paths.previewModule : undefined);

  if ("additionalPreviews" in entry) {
    for (const example of entry.additionalPreviews) {
      checkSourceFile(`${entry.id}.${example.id}.example`, example.source);
      checkPreview(
        `${entry.id}.${example.id}`,
        example.source,
        example.preview,
        "previewModule" in example ? example.previewModule : undefined,
      );
    }
  }

  if ("versions" in entry) {
    for (const version of entry.versions) {
      checkRegistryItem(`${entry.id}.${version.id}`, version.registryKind);
      checkSourceFile(`${entry.id}.${version.id}.example`, version.paths.example);
      checkSourceFile(`${entry.id}.${version.id}.source`, version.paths.source);
      checkPreview(`${entry.id}.${version.id}`, version.paths.example, version.preview);
    }
  }
}

const usedUseCaseKindIds = new Set<string>();

for (const entry of blockEntries) {
  if (!useCaseKinds.some((kind) => kind.id === entry.useCaseKind)) {
    failures.push(`${entry.id} references unknown use-case kind "${entry.useCaseKind}"`);
  }
  usedUseCaseKindIds.add(entry.useCaseKind);
  checkRegistryItem(entry.id, entry.registryKind);
  checkSourceFile(`${entry.id}.example`, entry.paths.example);
  checkRecord(`${entry.id}.usage`, entry.paths.usage);
  for (const file of entry.paths.files) checkSourceFile(`${entry.id}.files`, file);

  checkPreview(entry.id, entry.paths.example, entry.preview);
}

for (const kind of useCaseKinds) {
  if (!usedUseCaseKindIds.has(kind.id)) {
    failures.push(`Use-case kind "${kind.id}" has no entries`);
  }
}

for (const entry of primitiveEntries) {
  if (!categoryIds.has(entry.category)) {
    failures.push(`${entry.id} references unknown category "${entry.category}"`);
  }
  usedCategoryIds.add(entry.category);
  checkRegistryItem(entry.id, entry.paths.registry.registryKind);
  checkSourceFile(`${entry.id}.example`, entry.paths.registry.example);
  checkSourceFile(`${entry.id}.source`, entry.paths.registry.source);
  if ("supportFiles" in entry.paths.registry) {
    for (const file of entry.paths.registry.supportFiles) checkSourceFile(`${entry.id}.supportFiles`, file);
  }
  checkPreview(`${entry.id}.registry`, entry.paths.registry.example, entry.preview);
  if ("additionalPreviews" in entry) {
    for (const example of entry.additionalPreviews) {
      checkSourceFile(`${entry.id}.${example.id}.example`, example.source);
      checkPreview(`${entry.id}.${example.id}`, example.source, example.preview);
    }
  }
}

for (const category of catalogCategories) {
  if (!usedCategoryIds.has(category.id)) {
    failures.push(`Catalog category "${category.id}" has no entries`);
  }
}

for (const entry of hookEntries) {
  checkSourceFile(`${entry.id}.source`, entry.source);
}

for (const entry of utilEntries) {
  checkSourceFile(`${entry.id}.source`, entry.source);
}

for (const entry of extensionEntries) {
  checkRegistryItem(entry.id, entry.registryKind);
}

for (const skin of skinMetas) {
  if ("packManifestPath" in skin) checkRegistryItem(skin.id, `skin-${skin.id}`);
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log("Docs catalog validation passed.");
