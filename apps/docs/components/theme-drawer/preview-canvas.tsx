"use client";

import type { ReactNode } from "react";
import { BlockPreview, PrimitivePreview } from "@/app/(features)/components/previews";
import { ColorFoundations } from "@/app/(features)/foundations/color-foundations";
import { ElevationFoundations } from "@/app/(features)/foundations/elevation-foundations";
import { FocusFoundations } from "@/app/(features)/foundations/focus-foundations";
import { MotionFoundations } from "@/app/(features)/foundations/motion-foundations";
import { RadiusFoundations } from "@/app/(features)/foundations/radius-foundations";
import { SizingFoundations } from "@/app/(features)/foundations/sizing-foundations";
import { SurfaceFoundations } from "@/app/(features)/foundations/surface-foundations";
import { TypographyFoundations } from "@/app/(features)/foundations/typography-foundations";
import type { PrimitiveId } from "@/app/(features)/model/types";
import { cn } from "@/components/control-ui/lib/cn";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/control-ui/ui/tabs";
import type { ThemeContractGroup } from "@/src/registry/lib/theme-contract";
import { SKIN_CATEGORY, type ThemeCategoryId, TOKEN_GROUP_TITLES } from "./theme-categories";

type PreviewTile = { id: PrimitiveId; title: string; wide?: boolean; showcases: readonly ThemeContractGroup[] };

const PRIMITIVE_TILES: readonly PreviewTile[] = [
  { id: "typography", title: "Type scale", wide: true, showcases: ["typography"] },
  { id: "button", title: "Buttons", wide: true, showcases: ["color", "radius", "shadow", "layout", "typography"] },
  { id: "field", title: "Fields", showcases: ["color", "radius", "layout", "typography"] },
  { id: "select", title: "Select", showcases: ["radius", "shadow", "motion", "surface", "layout"] },
  { id: "slider", title: "Slider", showcases: ["color", "radius", "motion"] },
  { id: "switch", title: "Switch", showcases: ["color", "shadow", "motion"] },
  { id: "badge", title: "Badges", showcases: ["color", "radius", "typography"] },
  { id: "alert", title: "Alerts", showcases: ["color", "surface", "typography"] },
  { id: "tabs", title: "Tabs", showcases: ["radius", "shadow", "motion", "layout"] },
  { id: "progress", title: "Progress", showcases: ["color", "motion"] },
  { id: "card", title: "Cards", wide: true, showcases: ["radius", "shadow", "surface", "typography"] },
  { id: "table", title: "Table", wide: true, showcases: ["color", "surface", "layout", "typography"] },
];

function tilesShowcasing(category: ThemeCategoryId) {
  if (category === SKIN_CATEGORY) return PRIMITIVE_TILES;
  return PRIMITIVE_TILES.filter((tile) => tile.showcases.includes(category));
}

function PreviewSection({ title, wide, children }: { title: string; wide?: boolean; children: ReactNode }) {
  return (
    <section aria-label={title} className={cn("flex min-w-0 flex-col gap-3", wide && "@3xl/canvas:col-span-2")}>
      <h3 className="text-heading-4 font-display text-balance">{title}</h3>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function LayoutFoundations() {
  return (
    <div className="grid min-w-0 gap-10">
      <SizingFoundations />
      <FocusFoundations />
    </div>
  );
}

const FOUNDATION_BY_GROUP: Record<ThemeContractGroup, () => ReactNode> = {
  color: ColorFoundations,
  typography: TypographyFoundations,
  radius: RadiusFoundations,
  shadow: ElevationFoundations,
  motion: MotionFoundations,
  surface: SurfaceFoundations,
  layout: LayoutFoundations,
};

export function ThemePreviewCanvas({ category, actions }: { category: ThemeCategoryId; actions: ReactNode }) {
  const foundationGroup = category === SKIN_CATEGORY ? null : category;
  const Foundation = foundationGroup ? FOUNDATION_BY_GROUP[foundationGroup] : null;
  return (
    <Tabs
      key={category}
      defaultValue={foundationGroup ? "foundation" : "components"}
      className="@container/canvas flex min-w-0 flex-col gap-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TabsList>
          {foundationGroup ? <TabsTab value="foundation">{TOKEN_GROUP_TITLES[foundationGroup]}</TabsTab> : null}
          <TabsTab value="components">Components</TabsTab>
          <TabsTab value="application">Application</TabsTab>
        </TabsList>
        {actions}
      </div>

      {Foundation ? (
        <TabsPanel value="foundation" className="min-w-0">
          <Foundation />
        </TabsPanel>
      ) : null}

      <TabsPanel value="components" className="min-w-0">
        <div className="grid min-w-0 gap-x-8 gap-y-10 @3xl/canvas:grid-cols-2">
          {tilesShowcasing(category).map((tile) => (
            <PreviewSection key={tile.id} title={tile.title} wide={tile.wide}>
              <PrimitivePreview primitiveId={tile.id} />
            </PreviewSection>
          ))}
        </div>
      </TabsPanel>

      <TabsPanel value="application" className="min-w-0">
        <BlockPreview blockId="settings" integration="mastra" />
      </TabsPanel>
    </Tabs>
  );
}
