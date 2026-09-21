"use client";

import Link from "next/link";
import { DeferredPreview } from "@/app/(features)/components/deferred-preview";
import { Preview, PrimitivePreview } from "@/app/(features)/components/previews";
import { StatusBadge } from "@/app/(features)/components/status";
import type { CatalogGalleryGroup, CatalogGalleryItem } from "@/app/(features)/model/catalog-gallery";
import { useDocsIntegration } from "@/app/(features)/page-templates/integration";
import { PageHeader } from "./shared";

export function CatalogGalleryPage({
  label,
  title,
  summary,
  groups,
}: {
  label: string;
  title: string;
  summary: string;
  groups: CatalogGalleryGroup[];
}) {
  const integration = useDocsIntegration();

  return (
    <section className="@container/gallery docs-article">
      <PageHeader label={label} title={title} summary={summary} />
      <div className="grid min-w-0 gap-12">
        {groups.map((group) => (
          <section key={group.id} id={group.id} className="min-w-0 scroll-mt-20">
            <div className="mb-5 grid max-w-2xl gap-1.5">
              <h2 className="font-display text-heading-2 text-balance">{group.title}</h2>
              <p className="text-body-sm text-pretty text-muted-foreground">{group.summary}</p>
            </div>
            <div className="grid min-w-0 gap-x-4 gap-y-8 @2xl/gallery:grid-cols-2 @4xl/gallery:grid-cols-3">
              {group.items.map((item) => (
                <CatalogPreviewCard key={`${item.kind}-${item.id}`} item={item} integration={integration} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

function CatalogPreviewCard({
  item,
  integration,
}: {
  item: CatalogGalleryItem;
  integration: Parameters<typeof Preview>[0]["integration"];
}) {
  const nameId = `gallery-${item.kind}-${item.id}-name`;
  const summaryId = `gallery-${item.kind}-${item.id}-summary`;

  return (
    <article
      data-gallery-card={item.kind}
      data-gallery-item-id={item.id}
      className="group relative min-w-0 rounded-[var(--radius-panel)] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-card"
    >
      <Link
        href={item.href}
        aria-labelledby={nameId}
        aria-describedby={summaryId}
        className="absolute inset-0 z-10 rounded-[inherit] outline-none"
      />
      <div className="relative grid h-60 min-w-0 place-items-center overflow-hidden rounded-[inherit] border border-border/70 bg-canvas transition-[border-color,background-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-standard)] group-hover:border-foreground/20 group-hover:bg-muted/35 group-focus-within:border-ring/60">
        <DeferredPreview className={item.previewClassName}>
          {item.kind === "component" ? (
            <Preview componentId={item.id} integration={integration} />
          ) : (
            <PrimitivePreview primitiveId={item.id} />
          )}
        </DeferredPreview>
      </div>
      <div className="mt-3 flex min-w-0 items-center gap-2 px-0.5">
        <h3 id={nameId} className="min-w-0 truncate font-display text-body-lg font-medium text-foreground">
          {item.name}
        </h3>
        {item.status ? <StatusBadge status={item.status} compact className="shrink-0" /> : null}
      </div>
      <p id={summaryId} className="sr-only">
        {item.summary}
      </p>
    </article>
  );
}
