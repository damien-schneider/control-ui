"use client";

import Link from "next/link";
import { DeferredPreview } from "@/app/(features)/components/deferred-preview";
import { PreviewFrame } from "@/app/(features)/components/preview-frame";
import { CatalogGalleryItemPreview } from "@/app/(features)/components/previews";
import type { CatalogGalleryItem } from "@/app/(features)/model/catalog-gallery";
import { useDocsIntegration } from "@/app/(features)/page-templates/integration";
import { Card, CardContent, CardDescription, CardHeader, CardLink, CardTitle } from "@/components/control-ui/ui/card";

export function CatalogItemShowcaseCard({ item }: { item: CatalogGalleryItem }) {
  const integration = useDocsIntegration();

  return (
    <Card className="min-w-0">
      <CardContent className="grid h-72 min-w-0 place-items-center overflow-hidden">
        <DeferredPreview className={item.previewClassName}>
          <PreviewFrame layout={item.previewLayout}>
            <CatalogGalleryItemPreview item={item} integration={integration} />
          </PreviewFrame>
        </DeferredPreview>
      </CardContent>
      <CardHeader>
        <CardTitle render={(props) => <h3 {...props} />}>
          <CardLink render={<Link href={item.href} />}>{item.name}</CardLink>
        </CardTitle>
        <CardDescription>{item.summary}</CardDescription>
      </CardHeader>
    </Card>
  );
}
