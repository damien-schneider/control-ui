import { blockEntries } from "@/app/(features)/catalog/blocks";
import { componentEntries } from "@/app/(features)/catalog/components";
import { kitEntries } from "@/app/(features)/catalog/kits";
import { type CatalogGalleryItem, componentGalleryGroups } from "@/app/(features)/model/catalog-gallery";
import type { BlockId } from "@/app/(features)/model/types";

export const stageSceneId = "team-chat" as const satisfies BlockId;

export const componentCount = componentEntries.length;
export const kitCount = kitEntries.length;
export const templateCount = blockEntries.length;

export type ComponentItem = Extract<CatalogGalleryItem, { kind: "component" }>;

export type ComponentCategory = { id: string; title: string; items: ComponentItem[] };

export const componentCategories: ComponentCategory[] = componentGalleryGroups()
  .map((group) => ({
    id: group.id,
    title: group.title,
    items: group.items.filter((item): item is ComponentItem => item.kind === "component"),
  }))
  .toSorted((a, b) => b.items.length - a.items.length);

const countWords = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

export function countWord(count: number) {
  return countWords[count] ?? String(count);
}

export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
