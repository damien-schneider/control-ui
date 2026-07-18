// Reads the same catalog and generated registry metadata as human docs, so agent view cannot drift.

import { getDocsData } from "@/app/(features)/model/data";
import { registryMetadata } from "@/app/(features)/model/generated-registry";
import { generatedSkinContract } from "@/app/(features)/model/generated-skin-contract";
import { filesFor, type InstallCommand } from "@/app/(features)/model/registry";
import type { SearchItem, SourceFile } from "@/app/(features)/model/types";
import {
  allSearchItems,
  contractLinks,
  type Envelope,
  installCommandsFor,
  isRegistryItemId,
  manifestUrl,
  registryDeps,
  registryItemIdFor,
} from "./registry-index";

// Agent surfaces install from the one Control UI source; shadcn compatibility is a contract, not another source tree.

export type RegistryErrorCode = "ERR_UNKNOWN_ITEM";
export type RegistryError = {
  error: string;
  code: RegistryErrorCode;
  suggestions: { id: string; reason: string }[];
};

export type RegistryAnatomySlice = {
  version: typeof generatedSkinContract.version;
  contractUrl: string;
  selectorPattern: string;
  ownScopes: Record<string, (typeof generatedSkinContract.scopes)[keyof typeof generatedSkinContract.scopes]>;
  installedScopes: Record<string, (typeof generatedSkinContract.scopes)[keyof typeof generatedSkinContract.scopes]>;
};
export type RegistryItemData = {
  id: string;
  name: string;
  kind: SearchItem["kind"];
  summary: string;
  href: string;
  /** Maturity of the item; absent means stable. */
  status?: SearchItem["status"];
  install: InstallCommand[];
  manifestUrl?: string;
  deps?: { dependencies: string[]; registryDependencies: string[] };
  files: SourceFile[];
  anatomy?: RegistryAnatomySlice;
};

type DocsData = ReturnType<typeof getDocsData>;

function componentFiles(data: DocsData, id: SearchItem["id"]): SourceFile[] {
  const component = data.components.find((entry) => entry.id === id);
  return component ? filesFor(component) : [];
}

function blockFiles(data: DocsData, id: SearchItem["id"]): SourceFile[] {
  return data.blocks.find((entry) => entry.id === id)?.files ?? [];
}

function primitiveFiles(data: DocsData, id: SearchItem["id"]): SourceFile[] {
  const primitive = data.primitives.find((entry) => entry.id === id);
  return primitive ? [primitive.registry.source, ...(primitive.registry.supportFiles ?? [])] : [];
}

function hookFiles(data: DocsData, id: SearchItem["id"]): SourceFile[] {
  const source = data.hooks.find((entry) => entry.id === id)?.source;
  return source ? [source] : [];
}

function utilFiles(data: DocsData, id: SearchItem["id"]): SourceFile[] {
  const source = data.utils.find((entry) => entry.id === id)?.source;
  return source ? [source] : [];
}

function extensionFiles(data: DocsData, id: SearchItem["id"]): SourceFile[] {
  const extension = data.extensions.find((entry) => entry.id === id);
  return extension ? [extension.source, ...(extension.supportFiles ?? [])] : [];
}

function skinFiles(data: DocsData, id: SearchItem["id"]): SourceFile[] {
  return data.skinPages.find((entry) => entry.id === id)?.files ?? [];
}

function installedRegistryItems(itemId: string): Set<string> {
  const installed = new Set<string>();
  const pending = [itemId];
  for (const current of pending) {
    if (installed.has(current)) continue;
    installed.add(current);
    if (!isRegistryItemId(current)) continue;
    for (const dependency of registryMetadata[current].registryDependencies) {
      if (!installed.has(dependency)) pending.push(dependency);
    }
  }
  return installed;
}

function scopesOwnedBy(itemIds: Set<string>): RegistryAnatomySlice["ownScopes"] {
  return Object.fromEntries(
    Object.entries(generatedSkinContract.scopes).flatMap(([scopeName, scope]) => {
      const parts = Object.fromEntries(
        Object.entries(scope.parts).filter(([, part]) => (part.registryItems as readonly string[]).some((itemId) => itemIds.has(itemId))),
      );
      return Object.keys(parts).length > 0 ? [[scopeName, { ...scope, parts }]] : [];
    }),
  ) as RegistryAnatomySlice["ownScopes"];
}

function anatomyFor(itemId: string): RegistryAnatomySlice | undefined {
  const ownScopes = scopesOwnedBy(new Set([itemId]));
  const installedScopes = scopesOwnedBy(installedRegistryItems(itemId));
  if (Object.keys(installedScopes).length === 0) return undefined;
  return {
    version: generatedSkinContract.version,
    contractUrl: contractLinks().skin,
    selectorPattern: generatedSkinContract.selectorPattern,
    ownScopes,
    installedScopes,
  };
}

// The readable source files an agent would open for an item (empty for prose-only guides).
function filesForItem(item: SearchItem): SourceFile[] {
  const data = getDocsData();
  switch (item.kind) {
    case "Agent":
      return componentFiles(data, item.id);
    case "Block":
      return blockFiles(data, item.id);
    case "Primitive":
      return primitiveFiles(data, item.id);
    case "Hook":
      return hookFiles(data, item.id);
    case "Util":
      return utilFiles(data, item.id);
    case "Extension":
      return extensionFiles(data, item.id);
    case "Skin":
      return skinFiles(data, item.id);
    default:
      return [];
  }
}

// Levenshtein distance, capped — cheap enough for the small id set, only hit on a miss.
function editDistance(a: string, b: string): number {
  const rows = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) rows[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost);
    }
  }
  return rows[a.length][b.length];
}

function suggestionsFor(id: string): RegistryError["suggestions"] {
  const query = id.toLowerCase();
  const candidates: { id: string; distance: number }[] = [];
  const maxDistance = Math.max(2, Math.ceil(query.length / 2));
  for (const item of allSearchItems()) {
    const candidate = { id: String(item.id), distance: editDistance(query, String(item.id).toLowerCase()) };
    if (candidate.distance <= maxDistance) candidates.push(candidate);
  }
  return candidates
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3)
    .map((candidate) => ({ id: candidate.id, reason: "similar name" }));
}

export function getRegistryItem(id: string): Envelope<"item", RegistryItemData> | RegistryError {
  const item = allSearchItems().find((entry) => String(entry.id) === id);
  if (!item) {
    return { error: `No registry item named "${id}"`, code: "ERR_UNKNOWN_ITEM", suggestions: suggestionsFor(id) };
  }

  const registryItemId = registryItemIdFor(item);
  return {
    type: "item",
    data: {
      id: String(item.id),
      name: item.name,
      kind: item.kind,
      summary: item.summary,
      href: item.href,
      status: item.status,
      install: installCommandsFor(item),
      manifestUrl: manifestUrl(registryItemId),
      deps: registryDeps(registryItemId),
      files: filesForItem(item),
      anatomy: anatomyFor(registryItemId ?? String(item.id)),
    },
  };
}

export function isRegistryError(value: Envelope<string, unknown> | RegistryError): value is RegistryError {
  return "error" in value;
}
