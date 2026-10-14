"use client";

import Link from "next/link";
import { DeferredPreview } from "@/app/(features)/components/deferred-preview";
import { PreviewFrame } from "@/app/(features)/components/preview-frame";
import { CatalogGalleryItemPreview } from "@/app/(features)/components/previews";
import type { CatalogGalleryItem } from "@/app/(features)/model/catalog-gallery";
import { useDocsIntegration } from "@/app/(features)/page-templates/integration";
import { Heading, Text } from "@/components/control-ui/ui/typography";

export function CatalogItemShowcaseCard({ item }: { item: CatalogGalleryItem }) {
  const integration = useDocsIntegration();
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
      <div className="relative grid h-72 min-w-0 place-items-center overflow-hidden rounded-[inherit] border border-border/70 bg-canvas transition-[border-color,background-color] duration-[var(--duration-fast)] ease-[var(--ease-standard)] group-hover:border-foreground/20 group-hover:bg-muted/35 group-focus-within:border-ring/60">
        <DeferredPreview className={item.previewClassName}>
          <PreviewFrame layout={item.previewLayout}>
            <CatalogGalleryItemPreview item={item} integration={integration} />
          </PreviewFrame>
        </DeferredPreview>
      </div>
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
