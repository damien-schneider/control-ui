import { blockEntries, type TemplateKindId, templateKinds } from "@/app/(features)/catalog/blocks";
import { categoriesWithEntries } from "@/app/(features)/catalog/categories";
import { componentEntries } from "@/app/(features)/catalog/components";
import { kitEntries } from "@/app/(features)/catalog/kits";
import { catalogStatus, type PreviewLayout } from "@/app/(features)/catalog/shared";
import type { BlockId, ComponentId, DocsStatus, KitId } from "@/app/(features)/model/types";

type CatalogGalleryItemBase = {
  name: string;
  summary: string;
  status?: DocsStatus;
  href: string;
  previewClassName?: string;
  previewLayout?: PreviewLayout;
};

export type CatalogGalleryItem =
  | (CatalogGalleryItemBase & { kind: "kit"; id: KitId })
  | (CatalogGalleryItemBase & { kind: "component"; id: ComponentId });

export type CatalogGalleryGroup = {
  id: string;
  title: string;
  summary: string;
  items: CatalogGalleryItem[];
};

export type TemplateGalleryItem = CatalogGalleryItemBase & {
  id: BlockId;
  kind: TemplateKindId;
};

export type TemplateGalleryGroup = {
  id: (typeof templateKinds)[number]["slug"];
  kind: TemplateKindId;
  title: string;
  summary: string;
  items: TemplateGalleryItem[];
};

const galleryCollator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

function sortGalleryItems<T extends { id: string; name: string }>(items: T[]) {
  return items.toSorted((a, b) => galleryCollator.compare(a.name, b.name) || a.id.localeCompare(b.id));
}

export function kitGalleryGroups(): CatalogGalleryGroup[] {
  return categoriesWithEntries(kitEntries).map((category) => ({
    id: category.id,
    title: category.label,
    summary: category.summary,
    items: sortGalleryItems(
      kitEntries.flatMap((entry) =>
        entry.category === category.id
          ? [
              {
                kind: "kit" as const,
                id: entry.id,
                name: entry.name,
                summary: entry.summary,
                status: catalogStatus(entry),
                href: `/kits/${entry.id}`,
                previewClassName: "previewClassName" in entry ? entry.previewClassName : undefined,
                previewLayout: entry.preview.layout,
              },
            ]
          : [],
      ),
    ),
  }));
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
                previewLayout: entry.preview.layout,
              },
            ]
          : [],
      ),
    ),
  }));
}

export function templateGalleryGroups(): TemplateGalleryGroup[] {
  return templateKinds.map((kind) => ({
    id: kind.slug,
    kind: kind.id,
    title: kind.label,
    summary: kind.summary,
    items: sortGalleryItems(
      blockEntries.flatMap((entry) =>
        entry.templateKind === kind.id
          ? [
              {
                id: entry.id,
                kind: entry.templateKind,
                name: entry.name,
                summary: entry.summary,
                status: catalogStatus(entry),
                href: `/templates/${entry.id}`,
              },
            ]
          : [],
      ),
    ),
  }));
}
