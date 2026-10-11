"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { DeferredPreview } from "@/app/(features)/components/deferred-preview";
import { PreviewFrame } from "@/app/(features)/components/preview-frame";
import { BlockPreview, Preview, PrimitivePreview } from "@/app/(features)/components/previews";
import type { CatalogGalleryItem, UseCaseGalleryItem } from "@/app/(features)/model/catalog-gallery";
import { useDocsIntegration } from "@/app/(features)/page-templates/integration";
import { cn } from "@/components/control-ui/lib/cn";
import { Heading, Text } from "@/components/control-ui/ui/typography";

const previewSurfaceClassName =
  "relative min-w-0 overflow-hidden rounded-[inherit] border border-border/70 bg-canvas transition-[border-color,background-color] duration-[var(--duration-fast)] ease-[var(--ease-standard)] group-hover:border-foreground/20 group-hover:bg-muted/35 group-focus-within:border-ring/60";

function ShowcaseCard({ item, children }: { item: CatalogGalleryItem | UseCaseGalleryItem; children: ReactNode }) {
  const nameId = `home-${item.id}-name`;
  const summaryId = `home-${item.id}-summary`;

  return (
    <article className="group relative min-w-0 rounded-[var(--radius-panel)] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-canvas">
      <Link
        href={item.href}
        aria-labelledby={nameId}
        aria-describedby={summaryId}
        className="absolute inset-0 z-10 rounded-[inherit] outline-none"
      />
      {children}
      <div className="mt-3 grid min-w-0 gap-1 px-0.5">
        <Heading level={3} id={nameId} size="heading-4" tone="foreground" className="min-w-0 truncate">
          {item.name}
        </Heading>
        <Text as="p" id={summaryId} tone="muted" className="text-pretty">
          {item.summary}
        </Text>
      </div>
    </article>
  );
}

export function CatalogItemShowcaseCard({ item }: { item: CatalogGalleryItem }) {
  const integration = useDocsIntegration();

  return (
    <ShowcaseCard item={item}>
      <div className={cn(previewSurfaceClassName, "grid h-72 place-items-center")}>
        <DeferredPreview className={item.previewClassName}>
          <PreviewFrame layout={item.previewLayout}>
            {item.kind === "component" ? (
              <Preview componentId={item.id} integration={integration} />
            ) : (
              <PrimitivePreview primitiveId={item.id} />
            )}
          </PreviewFrame>
        </DeferredPreview>
      </div>
    </ShowcaseCard>
  );
}

export function TemplateShowcaseCard({ item }: { item: UseCaseGalleryItem }) {
  const integration = useDocsIntegration();

  return (
    <ShowcaseCard item={item}>
      <div className={cn(previewSurfaceClassName, "@container/home-template aspect-3/2")}>
        <DeferredPreview className="absolute inset-0 p-0">
          <div className="absolute top-0 left-1/2 h-160 w-240 origin-top -translate-x-1/2 scale-32 @sm/home-template:scale-40 @md/home-template:scale-46 @lg/home-template:scale-53 @xl/home-template:scale-60 @2xl/home-template:scale-70 @3xl/home-template:scale-80">
            <BlockPreview blockId={item.id} integration={integration} />
          </div>
        </DeferredPreview>
      </div>
    </ShowcaseCard>
  );
}
