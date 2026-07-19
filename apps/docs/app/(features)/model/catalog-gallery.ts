import { componentEntries } from "@/app/(features)/catalog/components";
import { primitiveCategories, primitiveEntries } from "@/app/(features)/catalog/primitives";
import { catalogStatus } from "@/app/(features)/catalog/shared";
import type { ComponentId, DocsStatus, PrimitiveId } from "@/app/(features)/model/types";

type CatalogGalleryItemBase = {
  name: string;
  summary: string;
  status?: DocsStatus;
  href: string;
  previewClassName?: string;
};

export type CatalogGalleryItem =
  | (CatalogGalleryItemBase & { kind: "agent"; id: ComponentId })
  | (CatalogGalleryItemBase & { kind: "primitive"; id: PrimitiveId });

export type CatalogGalleryGroup = {
  id: string;
  title: string;
  items: CatalogGalleryItem[];
};

const galleryCollator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

function sortGalleryItems(items: CatalogGalleryItem[]) {
  return items.toSorted((a, b) => galleryCollator.compare(a.name, b.name) || a.id.localeCompare(b.id));
}

export function agentGalleryGroups(): CatalogGalleryGroup[] {
  return [
    {
      id: "agents",
      title: "Agents",
      items: sortGalleryItems(
        componentEntries.map((entry) => ({
          kind: "agent",
          id: entry.id,
          name: entry.name,
          summary: entry.summary,
          status: catalogStatus(entry),
          href: `/ai/${entry.id}`,
          previewClassName: "previewClassName" in entry ? entry.previewClassName : undefined,
        })),
      ),
    },
  ];
}

export function primitiveGalleryGroups(): CatalogGalleryGroup[] {
  return primitiveCategories.map((category) => ({
    id: category.id,
    title: category.label,
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
