"use client";

import { IntentLink } from "@/app/(features)/client/intent-link";
import { DeferredPreview } from "@/app/(features)/components/deferred-preview";
import { PreviewFrame } from "@/app/(features)/components/preview-frame";
import { CatalogGalleryItemPreview } from "@/app/(features)/components/previews";
import { StatusBadge } from "@/app/(features)/components/status";
import type { CatalogGalleryGroup, CatalogGalleryItem } from "@/app/(features)/model/catalog-gallery";
import { useDocsIntegration } from "@/app/(features)/page-templates/integration";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardLink, CardTitle } from "@/components/control-ui/ui/card";
import { Heading, Text } from "@/components/control-ui/ui/typography";
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
              <Heading level={2}>{group.title}</Heading>
              <Text as="p" tone="muted" className="text-pretty">
                {group.summary}
              </Text>
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
  integration: Parameters<typeof CatalogGalleryItemPreview>[0]["integration"];
}) {
  return (
    <Card data-gallery-card={item.kind} data-gallery-item-id={item.id} className="min-w-0">
      <CardContent className="grid h-60 min-w-0 place-items-center overflow-hidden">
        <DeferredPreview className={item.previewClassName}>
          <PreviewFrame layout={item.previewLayout}>
            <CatalogGalleryItemPreview item={item} integration={integration} />
          </PreviewFrame>
        </DeferredPreview>
      </CardContent>
      <CardHeader>
        <CardTitle render={(props) => <h3 {...props} />}>
          <CardLink render={<IntentLink href={item.href} />}>{item.name}</CardLink>
        </CardTitle>
        <CardDescription>{item.summary}</CardDescription>
        {item.status ? (
          <CardAction>
            <StatusBadge status={item.status} compact />
          </CardAction>
        ) : null}
      </CardHeader>
    </Card>
  );
}
