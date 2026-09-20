"use client";

import type { ReactNode } from "react";
import { BlockPreview, PrimitivePreview } from "@/app/(features)/components/previews";
import type { PrimitiveId } from "@/app/(features)/model/types";
import { cn } from "@/components/control-ui/lib/cn";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/control-ui/ui/tabs";
import { ThemeArchitecture } from "./theme-architecture";
import type { SkinId, TokenValues } from "./types";

export function ElevationPreview() {
  return (
    <div className="grid w-full grid-cols-3 gap-3">
      <span className="rounded-[var(--radius-control)] bg-card p-3 text-micro font-medium text-muted-foreground shadow-sm">Control</span>
      <span className="rounded-[var(--radius-control)] bg-popover p-3 text-micro font-medium text-muted-foreground shadow-pop">
        Popover
      </span>
      <span className="rounded-[var(--radius-control)] bg-card p-3 text-micro font-medium text-muted-foreground shadow-modal">Modal</span>
    </div>
  );
}

export function LayerPreview({ values }: { values: TokenValues }) {
  const overlayOpacity = Number.parseFloat(values["--overlay-opacity"] ?? "");
  return (
    <div className="relative min-h-28 w-full overflow-hidden rounded-[var(--radius-control)] bg-canvas p-3 ring-1 ring-inset ring-border">
      <div
        className="absolute inset-0 bg-foreground backdrop-blur-[var(--backdrop-blur-overlay)]"
        style={{ opacity: Number.isNaN(overlayOpacity) ? 0.2 : overlayOpacity }}
      />
      <div className="relative ml-auto w-4/5 rounded-[var(--radius-popover)] bg-popover p-3 text-micro text-popover-foreground shadow-pop backdrop-blur-[var(--backdrop-blur-popover)]">
        Popover surface
      </div>
    </div>
  );
}

const PRIMITIVE_TILES: readonly { id: PrimitiveId; title: string; wide?: boolean }[] = [
  { id: "typography", title: "Type scale", wide: true },
  { id: "button", title: "Buttons", wide: true },
  { id: "field", title: "Fields" },
  { id: "select", title: "Select" },
  { id: "slider", title: "Slider" },
  { id: "switch", title: "Switch" },
  { id: "badge", title: "Badges" },
  { id: "alert", title: "Alerts" },
  { id: "tabs", title: "Tabs" },
  { id: "progress", title: "Progress" },
  { id: "card", title: "Cards", wide: true },
  { id: "table", title: "Table", wide: true },
];

function PreviewSection({ title, wide, children }: { title: string; wide?: boolean; children: ReactNode }) {
  return (
    <section aria-label={title} className={cn("flex min-w-0 flex-col gap-3", wide && "@3xl/canvas:col-span-2")}>
      <h3 className="font-medium text-micro text-muted-foreground uppercase tracking-wide">{title}</h3>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export function ThemePreviewCanvas({ values, skin }: { values: TokenValues; skin: SkinId }) {
  return (
    <Tabs defaultValue="components" className="@container/canvas flex min-w-0 flex-col gap-3">
      <TabsList className="self-start">
        <TabsTab value="components">Components</TabsTab>
        <TabsTab value="application">Application</TabsTab>
        <TabsTab value="anatomy">Skin anatomy</TabsTab>
      </TabsList>

      <TabsPanel value="components" className="min-w-0">
        <div className="grid min-w-0 gap-x-8 gap-y-10 @3xl/canvas:grid-cols-2">
          {PRIMITIVE_TILES.map((tile) => (
            <PreviewSection key={tile.id} title={tile.title} wide={tile.wide}>
              <PrimitivePreview primitiveId={tile.id} />
            </PreviewSection>
          ))}
          <PreviewSection title="Elevation">
            <ElevationPreview />
          </PreviewSection>
          <PreviewSection title="Overlays">
            <LayerPreview values={values} />
          </PreviewSection>
        </div>
      </TabsPanel>

      <TabsPanel value="application" className="min-w-0">
        <BlockPreview blockId="settings" integration="mastra" />
      </TabsPanel>

      <TabsPanel value="anatomy" className="min-w-0">
        <ThemeArchitecture skin={skin} />
      </TabsPanel>
    </Tabs>
  );
}
