import { blockEntries, getUseCaseKind } from "@/app/(features)/catalog/blocks";
import { componentEntries } from "@/app/(features)/catalog/components";
import { guideEntries } from "@/app/(features)/catalog/guides";
import { catalogOverview } from "@/app/(features)/catalog/overviews";
import { primitiveEntries } from "@/app/(features)/catalog/primitives";
import { skinPackIds, skinsOverviewId } from "@/app/(features)/catalog/skins";
import {
  useCaseGalleryGroups as blockGalleryGroups,
  componentGalleryGroups,
  primitiveGalleryGroups,
} from "@/app/(features)/model/catalog-gallery";
import type { BlockId, ComponentId, PrimitiveId, SkinMetaId } from "@/app/(features)/model/types";

const primitivesMissingFromShadcnIds = [
  "color-picker",
  "emoji-picker",
  "tree",
  "code-diff",
  "phone-input",
  "timeline",
] as const satisfies readonly PrimitiveId[];

const templateIds = ["file-explorer", "design-canvas", "settings"] as const satisfies readonly BlockId[];

const chatComponentIds = ["chat-message", "chat-composer", "activity"] as const satisfies readonly ComponentId[];

export const tryoutSkinIds = [
  "refined",
  "none",
  "windows-98",
  "xp",
  "modern-apple",
  "linear",
  "sketch",
  "rig",
] as const satisfies readonly SkinMetaId[];

export const tryoutSkinPageIds = tryoutSkinIds.filter((id) => skinPackIds.includes(id));

export const inlineLinkClassName =
  "font-medium text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground";

function pick<T extends { id: string }>(items: readonly T[], id: string): T {
  const item = items.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`Home showcase references an unknown catalog item: ${id}`);
  return item;
}

function pickInOrder<T extends { id: string }>(items: readonly T[], ids: readonly string[]): T[] {
  return ids.map((id) => pick(items, id));
}

export const primitivesMissingFromShadcn = pickInOrder(
  primitiveGalleryGroups().flatMap((group) => group.items),
  primitivesMissingFromShadcnIds,
);

export const showcasedTemplates = pickInOrder(
  blockGalleryGroups().flatMap((group) => group.items),
  templateIds,
);

export const templateKind = getUseCaseKind("template");

export const chatGroup = pick(componentGalleryGroups(), "chat");

export const chatComponents = pickInOrder(chatGroup.items, chatComponentIds);

export const missingFromShadcnGuide = pick(guideEntries, "components-missing-from-shadcn-ui");

export const shadcnComparisonGuide = pick(guideEntries, "control-ui-vs-shadcn-ui");

const primitivesOverview = catalogOverview("primitives");
const componentsOverview = catalogOverview("components");
const useCasesOverview = catalogOverview("use-cases");

export const templatesHref = `${useCasesOverview.href}#${templateKind.slug}`;

export const catalogIndex = [
  { href: primitivesOverview.href, name: primitivesOverview.name, count: primitiveEntries.length },
  { href: componentsOverview.href, name: componentsOverview.name, count: componentEntries.length },
  { href: useCasesOverview.href, name: useCasesOverview.name, count: blockEntries.length },
  { href: `/${skinsOverviewId}`, name: "Skins", count: skinPackIds.length },
];
