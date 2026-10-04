"use client";

import { ArrowUpRightIcon, Grid2X2Icon, LayoutDashboardIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useRef, useState } from "react";
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
import { Button, ButtonLink } from "@/components/control-ui/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/control-ui/ui/empty";
import { Input } from "@/components/control-ui/ui/input";
import { InputGroup, InputGroupAddon } from "@/components/control-ui/ui/input-group";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/control-ui/ui/tabs";
import { Heading, Text } from "@/components/control-ui/ui/typography";
import type { ThemeContractGroup } from "@/src/registry/lib/theme-contract";
import { SKIN_CATEGORY, type ThemeCategoryId, TOKEN_GROUP_TITLES } from "./theme-categories";

type PreviewTile = { id: PrimitiveId; title: string; wide?: boolean; showcases: readonly ThemeContractGroup[] };

const PRIMITIVE_TILES: readonly PreviewTile[] = [
  { id: "button", title: "Buttons", showcases: ["color", "radius", "shadow", "layout", "typography"] },
  { id: "field", title: "Fields", showcases: ["color", "radius", "layout", "typography"] },
  { id: "select", title: "Select", showcases: ["radius", "shadow", "motion", "surface", "layout"] },
  { id: "slider", title: "Slider", showcases: ["color", "radius", "motion"] },
  { id: "switch", title: "Switch", showcases: ["color", "shadow", "motion"] },
  { id: "badge", title: "Badges", showcases: ["color", "radius", "typography"] },
  { id: "alert", title: "Alerts", showcases: ["color", "surface", "typography"] },
  { id: "tabs", title: "Tabs", showcases: ["radius", "shadow", "motion", "layout"] },
  { id: "progress", title: "Progress", showcases: ["color", "motion"] },
  { id: "typography", title: "Type scale", wide: true, showcases: ["typography"] },
  { id: "card", title: "Cards", wide: true, showcases: ["radius", "shadow", "surface", "typography"] },
  { id: "table", title: "Table", wide: true, showcases: ["color", "surface", "layout", "typography"] },
];

function tilesShowcasing(category: ThemeCategoryId) {
  if (category === SKIN_CATEGORY) return PRIMITIVE_TILES;
  return PRIMITIVE_TILES.filter((tile) => tile.showcases.includes(category));
}

function PreviewSection({ id, title, wide, children }: { id: PrimitiveId; title: string; wide?: boolean; children: ReactNode }) {
  return (
    <section
      aria-label={title}
      className={cn("flex min-w-0 flex-col rounded-(--radius-panel) border border-border bg-card", wide && "@3xl/canvas:col-span-2")}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-2">
        <Heading level={3} size="label" tone="foreground">
          {title}
        </Heading>
        <ButtonLink
          render={<Link href={`/primitives/${id}`} />}
          variant="quiet"
          size="xs"
          iconOnly
          aria-label={`${title} documentation`}
          title={`${title} documentation`}
        >
          <ArrowUpRightIcon aria-hidden />
        </ButtonLink>
      </div>
      <div className="min-w-0 p-4 @lg/canvas:p-5">{children}</div>
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

export function ThemePreviewCanvas({ category, actions }: { category: ThemeCategoryId; actions?: ReactNode }) {
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const foundationGroup = category === SKIN_CATEGORY ? null : category;
  const Foundation = foundationGroup ? FOUNDATION_BY_GROUP[foundationGroup] : null;
  const tiles = tilesShowcasing(category);
  const visibleTiles = tiles.filter((tile) => `${tile.title} ${tile.id}`.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <Tabs
      key={category}
      defaultValue={foundationGroup ? "foundation" : "components"}
      className="@container/canvas flex min-w-0 flex-col gap-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TabsList aria-label="Preview content" size="sm">
          {foundationGroup ? <TabsTab value="foundation">{TOKEN_GROUP_TITLES[foundationGroup]}</TabsTab> : null}
          <TabsTab value="components">
            <Grid2X2Icon aria-hidden className="size-3.5" />
            Components
          </TabsTab>
          <TabsTab value="application">
            <LayoutDashboardIcon aria-hidden className="size-3.5" />
            Application
          </TabsTab>
        </TabsList>
        {actions}
      </div>

      {Foundation ? (
        <TabsPanel value="foundation" className="min-w-0">
          <Foundation />
        </TabsPanel>
      ) : null}

      <TabsPanel value="components" keepMounted className="min-w-0">
        <Heading level={2} className="sr-only">
          Component previews
        </Heading>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Text role="status" as="p" size="caption" tone="muted">
            {query.trim() ? `${visibleTiles.length} of ${tiles.length}` : tiles.length} component previews
          </Text>
          <div className="w-full @lg/canvas:w-64">
            <InputGroup size="sm">
              <InputGroupAddon>
                <SearchIcon aria-hidden className="size-3.5" />
              </InputGroupAddon>
              <Input
                ref={searchRef}
                type="search"
                aria-label="Search component previews"
                placeholder="Search components…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </InputGroup>
          </div>
        </div>
        <div className="grid min-w-0 items-start gap-4 @3xl/canvas:grid-cols-2">
          {visibleTiles.map((tile) => (
            <PreviewSection key={tile.id} id={tile.id} title={tile.title} wide={tile.wide}>
              <PrimitivePreview primitiveId={tile.id} />
            </PreviewSection>
          ))}
        </div>
        {visibleTiles.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No matching components</EmptyTitle>
              <EmptyDescription>Try a name like button, field, or typography.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                variant="surface"
                size="sm"
                onClick={() => {
                  setQuery("");
                  searchRef.current?.focus();
                }}
              >
                Clear search
              </Button>
            </EmptyContent>
          </Empty>
        ) : null}
      </TabsPanel>

      <TabsPanel value="application" className="min-w-0">
        <BlockPreview blockId="settings" integration="mastra" />
      </TabsPanel>
    </Tabs>
  );
}
