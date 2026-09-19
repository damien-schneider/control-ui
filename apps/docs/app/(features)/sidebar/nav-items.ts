import { useCaseKinds } from "@/app/(features)/catalog/blocks";
import { type GuideGroupId, guideGroups, referenceOverview } from "@/app/(features)/catalog/guides";
import { primitiveCategories } from "@/app/(features)/catalog/primitives";
import { skinsOverview } from "@/app/(features)/catalog/skins";
import type {
  ActivePageId,
  DocsBlock,
  DocsComponent,
  DocsExtension,
  DocsHook,
  DocsPrimitive,
  DocsUtil,
  GuidePage,
  SearchItem,
} from "@/app/(features)/model/types";
import type { DocsNavItem, SidebarMode, SidebarPane } from "./types";

const navCollator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

function sortNavItemsByName(items: DocsNavItem[]): DocsNavItem[] {
  return [...items].sort((a, b) => navCollator.compare(humanizeNavName(a.name), humanizeNavName(b.name)) || a.id.localeCompare(b.id));
}

const sidebarModeByKind: Partial<Record<SearchItem["kind"], SidebarMode>> = {
  Agent: "agents",
  Primitive: "primitives",
  Hook: "primitives",
  Util: "primitives",
  Extension: "primitives",
};

export const defaultSidebarMode: SidebarMode = "agents";

export function sidebarModeForActivePage(active: ActivePageId, searchItems: SearchItem[]): SidebarMode | null {
  const kind = searchItems.find((item) => item.id === active)?.kind;
  return kind ? (sidebarModeByKind[kind] ?? null) : null;
}

export function sidebarPaneForActivePage(active: ActivePageId, searchItems: SearchItem[], referenceGroups: GuideNavGroup[]): SidebarPane {
  const kind = searchItems.find((item) => item.id === active)?.kind;

  if (kind === "Block") return "use-cases";
  if (kind === "Skill") return "practices";
  if (active === referenceOverview.id || referenceGroups.some((group) => group.items.some((item) => item.id === active)))
    return "reference";
  return "root";
}

export function humanizeNavName(name: string) {
  if (name.includes(" ")) return name;

  const label = name
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();

  if (label === "cn") return label;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

// Skins is a route, not a guide entry, and it opens the Theme group.
const extraGroupItems: Partial<Record<GuideGroupId, DocsNavItem[]>> = {
  theme: [{ id: skinsOverview.id, name: skinsOverview.label }],
};

export type GuideNavGroup = {
  id: GuideGroupId;
  title: string;
  items: DocsNavItem[];
};

export function guideNavSections(guides: GuidePage[]): { top: GuideNavGroup[]; reference: GuideNavGroup[] } {
  const groups = guideGroups.map((group) => ({
    ...group,
    items: [
      ...(extraGroupItems[group.id] ?? []),
      ...guides.flatMap((guide) => (guide.cta || guide.group !== group.id ? [] : [{ id: guide.id, name: guide.name }])),
    ],
  }));

  return {
    top: groups.filter((group) => !("parent" in group)),
    reference: groups.filter((group) => "parent" in group),
  };
}

export function ctaGuide(guides: GuidePage[]) {
  return guides.find((guide) => guide.cta);
}

export function agentNavItems(components: DocsComponent[]): DocsNavItem[] {
  return sortNavItemsByName(
    components.map((component) => ({
      id: component.id,
      name: component.name,
      status: component.status,
    })),
  );
}

export function getUseCaseNavGroups(blocks: readonly Pick<DocsBlock, "id" | "useCaseKind" | "name" | "status">[]) {
  return useCaseKinds.map((kind) => ({
    id: kind.slug,
    kind: kind.id,
    title: kind.label,
    items: sortNavItemsByName(
      blocks.flatMap((block) =>
        block.useCaseKind === kind.id
          ? [
              {
                id: block.id,
                name: block.name,
                status: block.status,
              },
            ]
          : [],
      ),
    ),
  }));
}

export function primitiveNavGroups(primitives: Pick<DocsPrimitive, "id" | "category" | "name" | "status">[]) {
  return primitiveCategories.map((category) => ({
    id: category.id,
    title: category.label,
    items: sortNavItemsByName(
      primitives.flatMap((primitive) =>
        primitive.category === category.id
          ? [
              {
                id: primitive.id,
                name: primitive.name,
                status: primitive.status,
              },
            ]
          : [],
      ),
    ),
  }));
}

export function hookNavItems(hooks: DocsHook[]): DocsNavItem[] {
  return hooks.map((hook) => ({
    id: hook.id,
    name: hook.name,
  }));
}

export function utilNavItems(utils: DocsUtil[]): DocsNavItem[] {
  return utils.map((util) => ({
    id: util.id,
    name: util.name,
  }));
}

export function extensionNavItems(extensions: DocsExtension[]): DocsNavItem[] {
  return extensions.map((extension) => ({
    id: extension.id,
    name: extension.name,
    status: extension.status,
  }));
}
