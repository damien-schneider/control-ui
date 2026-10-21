import type { BlockId, ComponentId } from "@/app/(features)/model/types";
import type { ThemeContractGroup } from "@/src/registry/lib/theme-contract";
import { SKIN_CATEGORY, type ThemeCategoryId, TOKEN_GROUP_TITLES } from "./theme-categories";

type ComponentPreview = { id: ComponentId; title: string; showcases: readonly ThemeContractGroup[] };

const COMPONENT_PREVIEWS: readonly ComponentPreview[] = [
  { id: "button", title: "Buttons", showcases: ["color", "radius", "shadow", "layout", "typography"] },
  { id: "field", title: "Fields", showcases: ["color", "radius", "layout", "typography"] },
  { id: "select", title: "Select", showcases: ["radius", "shadow", "motion", "surface", "layout"] },
  { id: "slider", title: "Slider", showcases: ["color", "radius", "motion"] },
  { id: "switch", title: "Switch", showcases: ["color", "shadow", "motion"] },
  { id: "badge", title: "Badges", showcases: ["color", "radius", "typography"] },
  { id: "alert", title: "Alerts", showcases: ["color", "surface", "typography"] },
  { id: "tabs", title: "Tabs", showcases: ["radius", "shadow", "motion", "layout"] },
  { id: "progress", title: "Progress", showcases: ["color", "motion"] },
  { id: "typography", title: "Type scale", showcases: ["typography"] },
  { id: "card", title: "Cards", showcases: ["radius", "shadow", "surface", "typography"] },
  { id: "table", title: "Table", showcases: ["color", "surface", "layout", "typography"] },
];

export type ThemePreviewSection =
  | { kind: "foundation"; id: string; title: string; group: ThemeContractGroup }
  | { kind: "component"; id: string; title: string; componentId: ComponentId }
  | { kind: "application"; id: string; title: string; blockId: BlockId };

function componentPreviewsShowcasing(category: ThemeCategoryId) {
  if (category === SKIN_CATEGORY) return COMPONENT_PREVIEWS;
  return COMPONENT_PREVIEWS.filter((preview) => preview.showcases.includes(category));
}

export function themePreviewSections(category: ThemeCategoryId): ThemePreviewSection[] {
  const foundation: ThemePreviewSection[] =
    category === SKIN_CATEGORY
      ? []
      : [{ kind: "foundation", id: "preview-foundation", title: TOKEN_GROUP_TITLES[category], group: category }];
  const components = componentPreviewsShowcasing(category).map(
    (preview): ThemePreviewSection => ({ kind: "component", id: `preview-${preview.id}`, title: preview.title, componentId: preview.id }),
  );
  return [...foundation, ...components, { kind: "application", id: "preview-application", title: "Application", blockId: "settings" }];
}
