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
  DocsStatus,
  DocsUtil,
  GuidePage,
  SearchItem,
} from "@/app/(features)/model/types";
import type { CatalogNavGroupId, DocsNavItem, SidebarPane } from "./types";

const navCollator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

function sortNavItemsByName(items: DocsNavItem[]): DocsNavItem[] {
  return [...items].sort((a, b) => navCollator.compare(humanizeNavName(a.name), humanizeNavName(b.name)) || a.id.localeCompare(b.id));
}

export function sidebarPaneForActivePage(active: ActivePageId, searchItems: SearchItem[], referenceGroups: GuideNavGroup[]): SidebarPane {
  const kind = searchItems.find((item) => item.id === active)?.kind;

  if (active === "theme-editor") return "theme-editor";
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

export type CatalogNavGroup = {
  id: CatalogNavGroupId;
  title: string;
  prefix: string;
  items: DocsNavItem[];
};

type CatalogNavSource = {
  components: readonly Pick<DocsComponent, "id" | "name" | "status">[];
  primitives: readonly Pick<DocsPrimitive, "id" | "category" | "name" | "status">[];
  hooks: readonly Pick<DocsHook, "id" | "name">[];
  utils: readonly Pick<DocsUtil, "id" | "name">[];
  extensions: readonly Pick<DocsExtension, "id" | "name" | "status">[];
};

function navItem(entry: { id: string; name: string; status?: DocsStatus }): DocsNavItem {
  return { id: entry.id, name: entry.name, status: entry.status };
}

export function catalogNavGroups({ components, primitives, hooks, utils, extensions }: CatalogNavSource): CatalogNavGroup[] {
  return [
    { id: "agents", title: "Agents", prefix: "/ai/", items: sortNavItemsByName(components.map(navItem)) },
    ...primitiveCategories.map((category) => ({
      id: category.id,
      title: category.label,
      prefix: "/primitives/",
      items: sortNavItemsByName(primitives.filter((primitive) => primitive.category === category.id).map(navItem)),
    })),
    { id: "hooks", title: "Hooks", prefix: "/hooks/", items: hooks.map(navItem) },
    { id: "utils", title: "Utils", prefix: "/utils/", items: utils.map(navItem) },
    { id: "extensions", title: "Extensions", prefix: "/extensions/", items: extensions.map(navItem) },
  ];
}
