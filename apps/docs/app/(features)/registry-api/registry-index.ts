import { blockEntries } from "@/app/(features)/catalog/blocks";
import { componentEntries } from "@/app/(features)/catalog/components";
import { extensionEntries } from "@/app/(features)/catalog/extensions";
import { docsPageManifest } from "@/app/(features)/catalog/pages";
import { primitiveEntries } from "@/app/(features)/catalog/primitives";
import { skinMetas } from "@/app/(features)/catalog/skins";
import { registryMetadata } from "@/app/(features)/model/generated-registry";
import { isSkinPageId } from "@/app/(features)/model/page-ids";
import { type InstallCommand, packInstallCommand, registryInstallCommands } from "@/app/(features)/model/registry";
import type { RegistryKindId, SearchItem } from "@/app/(features)/model/types";
import { matchSearchItems } from "@/app/(features)/registry-api/search";
import { env } from "@/env";

export type Envelope<TType extends string, TData> = { type: TType; data: TData };
export type RegistryIndexItem = SearchItem & { install?: string };
export type RegistryContractLinks = { skin: string; theme: string };
export type RegistryFullInstall = {
  id: RegistryItemId;
  skin: string;
  name: string;
  summary: string;
  manifestUrl: string;
  install: string;
};
export type RegistryItemId = keyof typeof registryMetadata;

export function allSearchItems(): SearchItem[] {
  return [...docsPageManifest];
}

export function isRegistryItemId(value: string): value is RegistryItemId {
  return value in registryMetadata;
}

function blockRegistryKind(id: string) {
  return blockEntries.find((entry) => entry.id === id)?.registryKind;
}

function componentRegistryKind(id: string) {
  return componentEntries.find((component) => component.id === id)?.registryKind;
}

function primitiveRegistryKind(id: string) {
  return primitiveEntries.find((entry) => entry.id === id)?.paths.registry.registryKind;
}

function utilRegistryKind(_id: string): RegistryKindId | undefined {
  return undefined;
}

function extensionRegistryKind(id: string) {
  return extensionEntries.find((extension) => extension.id === id)?.registryKind;
}

export function registryItemIdFor(item: SearchItem): RegistryItemId | undefined {
  let id: string | undefined;
  switch (item.kind) {
    case "Agent":
      id = componentRegistryKind(item.id);
      break;
    case "Block":
      id = blockRegistryKind(item.id);
      break;
    case "Skin":
      id = skinMetas.some((entry) => entry.id === item.id && "packManifestPath" in entry) ? `skin-${item.id}` : undefined;
      break;
    case "Primitive":
      id = primitiveRegistryKind(item.id);
      break;
    case "Util":
      id = utilRegistryKind(item.id);
      break;
    case "Extension":
      id = extensionRegistryKind(item.id);
      break;
    default:
      return undefined;
  }
  return id && isRegistryItemId(id) ? id : undefined;
}

export function manifestUrl(itemId: RegistryItemId | undefined): string | undefined {
  return itemId ? `${env.NEXT_PUBLIC_REGISTRY_URL}/r/${itemId}.json` : undefined;
}

export function registryDeps(itemId: RegistryItemId | undefined): { dependencies: string[]; registryDependencies: string[] } | undefined {
  if (!itemId) return undefined;
  const metadata = registryMetadata[itemId];
  return {
    dependencies: [...metadata.dependencies],
    registryDependencies: [...metadata.registryDependencies],
  };
}

export function installCommandsFor(item: SearchItem): InstallCommand[] {
  switch (item.kind) {
    case "Agent": {
      const kind = componentRegistryKind(item.id);
      return kind ? registryInstallCommands(kind) : [];
    }
    case "Block": {
      const kind = blockRegistryKind(item.id);
      return kind ? registryInstallCommands(kind) : [];
    }
    case "Skin": {
      const command = isSkinPageId(item.id) ? packInstallCommand(item.id) : undefined;
      return command ? [{ label: "Skin pack", value: command }] : [];
    }
    case "Primitive": {
      const kind = primitiveRegistryKind(item.id);
      return kind ? registryInstallCommands(kind) : [];
    }
    case "Util": {
      const kind = utilRegistryKind(item.id);
      return kind ? registryInstallCommands(kind) : [];
    }
    case "Extension": {
      const kind = extensionRegistryKind(item.id);
      return kind ? registryInstallCommands(kind) : [];
    }
    default:
      return [];
  }
}

export function fullInstallBundles(): RegistryFullInstall[] {
  return skinMetas.flatMap((skin) => {
    const id = `all-${skin.id}`;
    if (!("packManifestPath" in skin) || !isRegistryItemId(id)) return [];
    const url = manifestUrl(id);
    if (!url) return [];
    return [
      {
        id,
        skin: skin.id,
        name: `All components — ${skin.label}`,
        summary: `Complete canonical Control UI component set with the ${skin.label} skin.`,
        manifestUrl: url,
        install: `npx shadcn@latest add ${url}`,
      },
    ];
  });
}

export function searchRegistry(query: string): SearchItem[] {
  return matchSearchItems(allSearchItems(), query);
}

export function contractLinks(): RegistryContractLinks {
  return {
    skin: `${env.NEXT_PUBLIC_REGISTRY_URL}/r/skin-contract.json`,
    theme: `${env.NEXT_PUBLIC_REGISTRY_URL}/r/theme-contract.json`,
  };
}

export function listRegistry(): Envelope<
  "index",
  { count: number; contracts: RegistryContractLinks; fullInstalls: RegistryFullInstall[]; items: RegistryIndexItem[] }
> {
  const items = allSearchItems().map<RegistryIndexItem>((item) => ({
    ...item,
    install: installCommandsFor(item)[0]?.value,
  }));
  return {
    type: "index",
    data: { count: items.length, contracts: contractLinks(), fullInstalls: fullInstallBundles(), items },
  };
}
