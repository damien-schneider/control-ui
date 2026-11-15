"use client";

import Link from "next/link";
import { DeferredPreview } from "@/app/(features)/components/deferred-preview";
import { BlockPreview } from "@/app/(features)/components/previews";
import { StatusBadge } from "@/app/(features)/components/status";
import type { TemplateGalleryGroup, TemplateGalleryItem } from "@/app/(features)/model/catalog-gallery";
import type { IntegrationId } from "@/app/(features)/model/types";
import { useDocsIntegration } from "@/app/(features)/page-templates/integration";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardLink, CardTitle } from "@/components/control-ui/ui/card";
import { Heading, Text } from "@/components/control-ui/ui/typography";
import { PageHeader } from "./shared";

export function TemplateGalleryPage({
  label,
  title,
  summary,
  groups,
}: {
  label: string;
  title: string;
  summary: string;
  groups: TemplateGalleryGroup[];
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
            <div
              className={
                group.kind === "screen"
                  ? "grid min-w-0 gap-x-4 gap-y-8 @4xl/gallery:grid-cols-2"
                  : "grid min-w-0 gap-x-4 gap-y-8 @2xl/gallery:grid-cols-2 @4xl/gallery:grid-cols-3"
              }
            >
              {group.items.map((item) => (
                <TemplatePreviewCard key={item.id} item={item} integration={integration} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

function TemplatePreviewCard({ item, integration }: { item: TemplateGalleryItem; integration: IntegrationId }) {
  return (
    <Card data-template-card={item.id} data-template-kind={item.kind} className="min-w-0">
      {item.kind === "screen" ? (
        <CardContent className="@container/template-card relative aspect-3/2 min-w-0 overflow-hidden">
          <DeferredPreview className="absolute inset-0 p-0">
            <div className="absolute top-0 left-1/2 h-160 w-240 origin-top -translate-x-1/2 scale-32 @sm/template-card:scale-40 @md/template-card:scale-46 @lg/template-card:scale-53 @xl/template-card:scale-60 @2xl/template-card:scale-70 @3xl/template-card:scale-80">
              <BlockPreview blockId={item.id} integration={integration} />
            </div>
          </DeferredPreview>
        </CardContent>
      ) : (
        <CardContent className="grid h-60 min-w-0 place-items-center overflow-hidden">
          <DeferredPreview>
            <BlockPreview blockId={item.id} integration={integration} />
          </DeferredPreview>
        </CardContent>
      )}
      <CardHeader>
        <CardTitle render={(props) => <h3 {...props} />}>
          <CardLink render={<Link href={item.href} />}>{item.name}</CardLink>
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
