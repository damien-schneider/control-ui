import { blockEntries } from "@/app/(features)/catalog/blocks";
import { componentEntries } from "@/app/(features)/catalog/components";
import { guideEntries } from "@/app/(features)/catalog/guides";
import { kitEntries } from "@/app/(features)/catalog/kits";
import { catalogOverview } from "@/app/(features)/catalog/overviews";
import { skinPackIds, skinsOverviewId } from "@/app/(features)/catalog/skins";
import {
  templateGalleryGroups as blockGalleryGroups,
  componentGalleryGroups,
  kitGalleryGroups,
} from "@/app/(features)/model/catalog-gallery";
import type { BlockId, ComponentId, KitId, SkinMetaId } from "@/app/(features)/model/types";

const componentsMissingFromShadcnIds = [
  "color-picker",
  "emoji-picker",
  "tree",
  "code-diff",
  "phone-input",
  "timeline",
] as const satisfies readonly ComponentId[];

const heroSceneIds = ["team-chat", "file-explorer", "coding-agent", "design-canvas", "settings"] as const satisfies readonly BlockId[];

export const defaultHeroSceneId = heroSceneIds[0];

const chatKitIds = ["chat-message", "chat-composer", "activity"] as const satisfies readonly KitId[];

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

export const inlineLinkClassName =
  "font-medium text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground";

export const landingWidthClassName = "mx-auto w-full max-w-6xl px-5 md:px-8";

function pick<T extends { id: string }>(items: readonly T[], id: string): T {
  const item = items.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`Home showcase references an unknown catalog item: ${id}`);
  return item;
}

function pickInOrder<T extends { id: string }>(items: readonly T[], ids: readonly string[]): T[] {
  return ids.map((id) => pick(items, id));
}

export const componentsMissingFromShadcn = pickInOrder(
  componentGalleryGroups().flatMap((group) => group.items),
  componentsMissingFromShadcnIds,
);

export const heroScenes = pickInOrder(
  blockGalleryGroups().flatMap((group) => group.items),
  heroSceneIds,
);

export const chatGroup = pick(kitGalleryGroups(), "chat");

export const chatKits = pickInOrder(chatGroup.items, chatKitIds);

export const missingFromShadcnGuide = pick(guideEntries, "components-missing-from-shadcn-ui");

export const shadcnComparisonGuide = pick(guideEntries, "control-ui-vs-shadcn-ui");

export const createASkinGuide = pick(guideEntries, "create-a-skin");

const componentsOverview = catalogOverview("components");
const kitsOverview = catalogOverview("kits");
const templatesOverview = catalogOverview("templates");

export const catalogIndex = [
  { href: componentsOverview.href, name: componentsOverview.name, count: componentEntries.length },
  { href: kitsOverview.href, name: kitsOverview.name, count: kitEntries.length },
  { href: templatesOverview.href, name: templatesOverview.name, count: blockEntries.length },
  { href: `/${skinsOverviewId}`, name: "Skins", count: skinPackIds.length },
];
