// Reads same catalog and generated registry metadata as human docs, so agent view cannot drift.

import { getDocsData } from "@/app/(features)/model/data";
import { registryMetadata } from "@/app/(features)/model/generated-registry";
import { generatedSkinContract } from "@/app/(features)/model/generated-skin-contract";
import { filesFor, type InstallCommand } from "@/app/(features)/model/registry";
import type { SearchItem, SourceFile } from "@/app/(features)/model/types";
// Type-only: skin contract's shape is declared where it is generated, so agent API cannot describe it differently.
import type { ContractKnob, ContractPart, ContractScope, SkinContract } from "@/scripts/skin-contract/model";
import {
  allSearchItems,
  contractLinks,
  type Envelope,
  fullInstallBundles,
  installCommandsFor,
  isRegistryItemId,
  manifestUrl,
  registryDeps,
  registryItemIdFor,
} from "./registry-index";

// Agent surfaces install from one Control UI source; shadcn compatibility is contract, not another source tree.

export type RegistryErrorCode = "ERR_UNKNOWN_ITEM";
export type RegistryError = {
  error: string;
  code: RegistryErrorCode;
  suggestions: { id: string; reason: string }[];
};

// Scopes here are a filtered projection — only parts item owns — so they are typed by contract model the
// generator emits against, not by generated value.
export type RegistryAnatomySlice = {
  version: SkinContract["version"];
  contractUrl: string;
  selectorPattern: string;
  ownScopes: Record<string, ContractScope>;
  installedScopes: Record<string, ContractScope>;
  knobs: Record<string, ContractKnob[]>;
};
export type RegistryItemData = {
  id: string;
  name: string;
  kind: SearchItem["kind"] | "Bundle";
  summary: string;
  href: string;
  /** Maturity of item; absent means stable. */
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

function partsOwnedBy(parts: Record<string, ContractPart>, itemIds: Set<string>): Record<string, ContractPart> {
  return Object.fromEntries(Object.entries(parts).filter(([, part]) => part.registryItems.some((itemId) => itemIds.has(itemId))));
}

function scopesOwnedBy(itemIds: Set<string>): Record<string, ContractScope> {
  return Object.fromEntries(
    Object.entries(generatedSkinContract.scopes).flatMap(([scopeName, scope]) => {
      const parts = partsOwnedBy(scope.parts, itemIds);
      return Object.keys(parts).length > 0 ? [[scopeName, { ...scope, parts }]] : [];
    }),
  );
}

function knobFamiliesOwnedBy(itemIds: Set<string>): Record<string, ContractKnob[]> {
  const families = new Set<string>();
  for (const [scopeName, scope] of Object.entries(generatedSkinContract.scopes)) {
    for (const part of Object.values(scope.parts)) {
      if (!part.registryItems.some((itemId) => itemIds.has(itemId))) continue;
      families.add(part.family ?? scopeName);
    }
  }
  return Object.fromEntries(
    [...families]
      .filter((family) => family in generatedSkinContract.knobs)
      .sort()
      .map((family) => [family, generatedSkinContract.knobs[family]]),
  );
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
    knobs: knobFamiliesOwnedBy(installedRegistryItems(itemId)),
  };
}

// readable source files agent would open for item (empty for prose-only guides).
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

// Levenshtein distance, capped — cheap enough for small id set, only hit on miss.
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

function fullInstallItem(id: string): Envelope<"item", RegistryItemData> | undefined {
  const bundle = fullInstallBundles().find((entry) => entry.id === id);
  if (!bundle) return undefined;
  return {
    type: "item",
    data: {
      id: bundle.id,
      name: bundle.name,
      kind: "Bundle",
      summary: bundle.summary,
      href: "/get-started",
      install: [{ label: "Registry command", value: bundle.install }],
      manifestUrl: bundle.manifestUrl,
      deps: registryDeps(bundle.id),
      files: [],
      anatomy: anatomyFor(bundle.id),
    },
  };
}

export function getRegistryItem(id: string): Envelope<"item", RegistryItemData> | RegistryError {
  const bundle = fullInstallItem(id);
  if (bundle) return bundle;
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
