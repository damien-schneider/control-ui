"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Preview, PrimitivePreview } from "@/app/(features)/components/previews";
import { StatusBadge } from "@/app/(features)/components/status";
import type { CatalogGalleryGroup, CatalogGalleryItem } from "@/app/(features)/model/catalog-gallery";
import { useDocsIntegration } from "@/app/(features)/page-templates/routed-page";
import { cn } from "@/components/control-ui/lib/cn";
import { PageHeader } from "./shared";

const previewRootMargin = "720px 0px";

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
    <section className="@container/gallery mx-auto min-w-0 w-full max-w-6xl px-5 py-12">
      <PageHeader label={label} title={title} summary={summary} wide />
      <div className="grid min-w-0 gap-12">
        {groups.map((group) => (
          <section key={group.id} id={group.id} className="min-w-0 scroll-mt-20">
            <h2 className="mb-4 font-display text-heading-2">{group.title}</h2>
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
        className="absolute inset-0 z-10 rounded-[var(--radius-panel)] outline-none"
      />
      <div className="relative grid h-60 min-w-0 place-items-center overflow-hidden rounded-[var(--radius-panel)] border border-border/70 bg-canvas transition-[border-color,background-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-standard)] group-hover:border-foreground/20 group-hover:bg-muted/35 group-focus-within:border-ring/60">
        <DeferredPreview className={item.previewClassName}>
          {item.kind === "agent" ? <Preview componentId={item.id} integration={integration} /> : <PrimitivePreview primitiveId={item.id} />}
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

function DeferredPreview({ children, className }: { children: ReactNode; className?: string }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (!("IntersectionObserver" in window)) {
      const frame = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(([entry]) => setMounted(Boolean(entry?.isIntersecting)), {
      rootMargin: previewRootMargin,
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={hostRef}
      inert
      aria-hidden="true"
      data-gallery-preview=""
      data-gallery-preview-state={mounted ? "mounted" : "deferred"}
      className={cn("pointer-events-none grid h-full w-full min-w-0 select-none place-items-center overflow-hidden p-5", className)}
    >
      {mounted ? (
        <div className="starting:opacity-0 grid h-full w-full min-w-0 place-items-center opacity-100 transition-opacity duration-[var(--duration-base)] ease-[var(--ease-standard)]">
          {children}
        </div>
      ) : null}
    </div>
  );
}
