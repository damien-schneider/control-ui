import { type CatalogRegistryKind, type CatalogSourceFile, includesString, registryKindIds } from "@/app/(features)/catalog/shared";
import { source } from "@/app/(features)/model/data-source";
import { registryMetadata } from "@/app/(features)/model/generated-registry";
import type { SourceFile } from "@/app/(features)/model/types";

type RegistryMetadataFile = {
  readonly path: string;
  readonly target: string;
  readonly type: string;
};

type RegistryMetadataItem = {
  readonly registryDependencies: readonly string[];
  readonly files: readonly RegistryMetadataFile[];
};

const registryMetadataById: Readonly<Record<string, RegistryMetadataItem | undefined>> = registryMetadata;

function registryItem(id: string): RegistryMetadataItem {
  const item = registryMetadataById[id];
  if (!item) throw new Error(`Unknown registry item ${id}`);
  return item;
}

function sourceLabel(filePath: string) {
  const fileName =
    filePath
      .split("/")
      .at(-1)
      ?.replace(/\.[^.]+$/, "") ?? filePath;
  const words = fileName.replaceAll("_", "-").split("-").filter(Boolean);
  const label = words.join(" ");
  return label ? `${label[0]?.toUpperCase() ?? ""}${label.slice(1)}` : filePath;
}

function sourceSlot(type: string) {
  if (type === "registry:hook") return "hook";
  if (type === "registry:lib") return "util";
  return "support";
}

function collectRegistryFiles(registryKind: string, shouldVisitDependency: (dependency: string) => boolean) {
  const files: RegistryMetadataFile[] = [];
  const visitedItems = new Set<string>();
  const sourceByTarget = new Map<string, string>();

  function addFile(file: RegistryMetadataFile) {
    const installedSource = sourceByTarget.get(file.target);
    if (installedSource && installedSource !== file.path) {
      throw new Error(`${registryKind}: ${file.target} is provided by both ${installedSource} and ${file.path}`);
    }
    if (installedSource) return;

    sourceByTarget.set(file.target, file.path);
    files.push(file);
  }

  function visit(itemId: string) {
    if (visitedItems.has(itemId)) return;
    visitedItems.add(itemId);

    const item = registryItem(itemId);
    for (const file of item.files) addFile(file);

    for (const dependency of item.registryDependencies) {
      if (shouldVisitDependency(dependency)) visit(dependency);
    }
  }

  visit(registryKind);
  return files;
}

export function installedRegistryFiles(registryKind: string): RegistryMetadataFile[] {
  return collectRegistryFiles(registryKind, () => true);
}

export function documentedRegistryFiles(registryKind: string): RegistryMetadataFile[] {
  return collectRegistryFiles(registryKind, (dependency) => dependency !== "core" && !includesString(registryKindIds, dependency));
}

export function publicRegistryDependencies(registryKind: string): CatalogRegistryKind[] {
  return registryItem(registryKind).registryDependencies.filter((dependency) => includesString(registryKindIds, dependency));
}

export function registryDocumentedSourceFiles(registryKind: string, declaredFiles: readonly CatalogSourceFile[]): SourceFile[] {
  const declaredByPath = new Map(declaredFiles.map((file) => [file.path, file]));
  const documentedFiles = documentedRegistryFiles(registryKind);
  const installedPaths = new Set(installedRegistryFiles(registryKind).map((file) => file.path));

  for (const declaredFile of declaredFiles) {
    if (!installedPaths.has(declaredFile.path)) {
      throw new Error(`${registryKind}: documented source ${declaredFile.path} is not part of its registry install closure`);
    }
  }

  const documentedPaths = new Set(documentedFiles.map((file) => file.path));
  const files: SourceFile[] = documentedFiles.map((file) => {
    const declaredFile = declaredByPath.get(file.path);
    return source(declaredFile?.label ?? sourceLabel(file.path), file.path, declaredFile?.slot ?? sourceSlot(file.type));
  });
  for (const declaredFile of declaredFiles) {
    if (!documentedPaths.has(declaredFile.path)) {
      files.push({ ...source(declaredFile.label, declaredFile.path, declaredFile.slot), shared: true });
    }
  }
  return files;
}
