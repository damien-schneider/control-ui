import { blockEntries, type UseCaseKindId, useCaseKinds } from "@/app/(features)/catalog/blocks";
import { categoriesWithEntries } from "@/app/(features)/catalog/categories";
import { componentEntries } from "@/app/(features)/catalog/components";
import { primitiveEntries } from "@/app/(features)/catalog/primitives";
import { catalogStatus } from "@/app/(features)/catalog/shared";
import type { BlockId, ComponentId, DocsStatus, PrimitiveId } from "@/app/(features)/model/types";

type CatalogGalleryItemBase = {
  name: string;
  summary: string;
  status?: DocsStatus;
  href: string;
  previewClassName?: string;
};

export type CatalogGalleryItem =
  | (CatalogGalleryItemBase & { kind: "component"; id: ComponentId })
  | (CatalogGalleryItemBase & { kind: "primitive"; id: PrimitiveId });

export type CatalogGalleryGroup = {
  id: string;
  title: string;
  summary: string;
  items: CatalogGalleryItem[];
};

export type UseCaseGalleryItem = CatalogGalleryItemBase & {
  id: BlockId;
  kind: UseCaseKindId;
};

export type UseCaseGalleryGroup = {
  id: (typeof useCaseKinds)[number]["slug"];
  kind: UseCaseKindId;
  title: string;
  summary: string;
  items: UseCaseGalleryItem[];
};

const galleryCollator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

function sortGalleryItems<T extends { id: string; name: string }>(items: T[]) {
  return items.toSorted((a, b) => galleryCollator.compare(a.name, b.name) || a.id.localeCompare(b.id));
}

export function componentGalleryGroups(): CatalogGalleryGroup[] {
  return categoriesWithEntries(componentEntries).map((category) => ({
    id: category.id,
    title: category.label,
    summary: category.summary,
    items: sortGalleryItems(
      componentEntries.flatMap((entry) =>
        entry.category === category.id
          ? [
              {
                kind: "component" as const,
                id: entry.id,
                name: entry.name,
                summary: entry.summary,
                status: catalogStatus(entry),
                href: `/components/${entry.id}`,
                previewClassName: "previewClassName" in entry ? entry.previewClassName : undefined,
              },
            ]
          : [],
      ),
    ),
  }));
}

export function primitiveGalleryGroups(): CatalogGalleryGroup[] {
  return categoriesWithEntries(primitiveEntries).map((category) => ({
    id: category.id,
    title: category.label,
    summary: category.summary,
    items: sortGalleryItems(
      primitiveEntries.flatMap((entry) =>
        entry.category === category.id
          ? [
              {
                kind: "primitive" as const,
                id: entry.id,
                name: entry.name,
                summary: entry.summary,
                status: catalogStatus(entry),
                href: `/primitives/${entry.id}`,
                previewClassName: "previewClassName" in entry ? entry.previewClassName : undefined,
              },
            ]
          : [],
      ),
    ),
  }));
}

export function useCaseGalleryGroups(): UseCaseGalleryGroup[] {
  return useCaseKinds.map((kind) => ({
    id: kind.slug,
    kind: kind.id,
    title: kind.label,
    summary: kind.summary,
    items: sortGalleryItems(
      blockEntries.flatMap((entry) =>
        entry.useCaseKind === kind.id
          ? [
              {
                id: entry.id,
                kind: entry.useCaseKind,
                name: entry.name,
                summary: entry.summary,
                status: catalogStatus(entry),
                href: `/use-cases/${entry.id}`,
              },
            ]
          : [],
      ),
    ),
  }));
}
