"use client";

import Link from "next/link";
import { DeferredPreview } from "@/app/(features)/components/deferred-preview";
import { BlockPreview } from "@/app/(features)/components/previews";
import { StatusBadge } from "@/app/(features)/components/status";
import type { UseCaseGalleryGroup, UseCaseGalleryItem } from "@/app/(features)/model/catalog-gallery";
import type { IntegrationId } from "@/app/(features)/model/types";
import { useDocsIntegration } from "@/app/(features)/page-templates/routed-page";
import { PageHeader } from "./shared";

export function UseCaseGalleryPage({
  label,
  title,
  summary,
  groups,
}: {
  label: string;
  title: string;
  summary: string;
  groups: UseCaseGalleryGroup[];
}) {
  const integration = useDocsIntegration();

  return (
    <section className="@container/gallery mx-auto min-w-0 w-full max-w-6xl px-5 py-12">
      <PageHeader label={label} title={title} summary={summary} wide />
      <div className="grid min-w-0 gap-12">
        {groups.map((group) => (
          <section key={group.id} id={group.id} className="min-w-0 scroll-mt-20">
            <div className="mb-5 grid max-w-2xl gap-1.5">
              <h2 className="font-display text-heading-2">{group.title}</h2>
              <p className="text-body-sm text-muted-foreground">{group.summary}</p>
            </div>
            <div
              className={
                group.kind === "template"
                  ? "grid min-w-0 gap-x-4 gap-y-8 @4xl/gallery:grid-cols-2"
                  : "grid min-w-0 gap-x-4 gap-y-8 @2xl/gallery:grid-cols-2 @4xl/gallery:grid-cols-3"
              }
            >
              {group.items.map((item) => (
                <UseCasePreviewCard key={item.id} item={item} integration={integration} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

function UseCasePreviewCard({ item, integration }: { item: UseCaseGalleryItem; integration: IntegrationId }) {
  const nameId = `use-case-${item.id}-name`;
  const summaryId = `use-case-${item.id}-summary`;

  return (
    <article
      data-use-case-card={item.id}
      data-use-case-kind={item.kind}
      className="group relative min-w-0 rounded-[var(--radius-panel)] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-card"
    >
      <Link
        href={item.href}
        aria-labelledby={nameId}
        aria-describedby={summaryId}
        className="absolute inset-0 z-10 rounded-[var(--radius-panel)] outline-none"
      />
      {item.kind === "template" ? (
        <TemplatePreview item={item} integration={integration} />
      ) : (
        <PatternPreview item={item} integration={integration} />
      )}
      <div className="mt-3 grid min-w-0 gap-1 px-0.5">
        <div className="flex min-w-0 items-center gap-2">
          <h3 id={nameId} className="min-w-0 truncate font-display text-body-lg font-medium text-foreground">
            {item.name}
          </h3>
          {item.status ? <StatusBadge status={item.status} compact className="shrink-0" /> : null}
        </div>
        <p id={summaryId} className="text-body-sm text-muted-foreground">
          {item.summary}
        </p>
      </div>
    </article>
  );
}

function TemplatePreview({ item, integration }: { item: UseCaseGalleryItem; integration: IntegrationId }) {
  return (
    <div className="@container/use-case-card relative aspect-3/2 min-w-0 overflow-hidden rounded-[var(--radius-panel)] border border-border/70 bg-canvas transition-[border-color,background-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-standard)] group-hover:border-foreground/20 group-hover:bg-muted/35 group-focus-within:border-ring/60">
      <DeferredPreview className="absolute inset-0 p-0">
        <div className="absolute top-0 left-1/2 h-160 w-240 origin-top -translate-x-1/2 scale-32 @sm/use-case-card:scale-40 @md/use-case-card:scale-46 @lg/use-case-card:scale-53 @xl/use-case-card:scale-60 @2xl/use-case-card:scale-70 @3xl/use-case-card:scale-80">
          <BlockPreview blockId={item.id} integration={integration} />
        </div>
      </DeferredPreview>
    </div>
  );
}

function PatternPreview({ item, integration }: { item: UseCaseGalleryItem; integration: IntegrationId }) {
  return (
    <div className="relative grid h-60 min-w-0 place-items-center overflow-hidden rounded-[var(--radius-panel)] border border-border/70 bg-canvas transition-[border-color,background-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-standard)] group-hover:border-foreground/20 group-hover:bg-muted/35 group-focus-within:border-ring/60">
      <DeferredPreview>
        <BlockPreview blockId={item.id} integration={integration} />
      </DeferredPreview>
    </div>
  );
}
