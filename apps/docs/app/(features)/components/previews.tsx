"use client";

import { createContext, type ReactNode, Suspense, use } from "react";
import type { CatalogGalleryItem } from "@/app/(features)/model/catalog-gallery";
import type { BlockId, ComponentId, IntegrationId, KitId, UtilId } from "@/app/(features)/model/types";
import { Skeleton } from "@/components/control-ui/ui/skeleton";
import {
  blockPreviewTarget,
  componentExamplePreviewTarget,
  componentPreviewTarget,
  type KitChoiceKind,
  kitChoicePreviewTarget,
  kitExamplePreviewTarget,
  kitPreviewTarget,
  type LoadedPreviews,
  type PreviewTarget,
  utilPreviewTarget,
} from "./preview-targets";

const previewFallback = <Skeleton data-preview-loading="" className="min-h-40 w-full self-stretch" />;

const ServerLoadedPreviews = createContext<LoadedPreviews>({});

export function ServerLoadedPreviewsProvider({ previews, children }: { previews: LoadedPreviews; children: ReactNode }) {
  return <ServerLoadedPreviews value={previews}>{children}</ServerLoadedPreviews>;
}

function TargetPreview({ target, integration }: { target: PreviewTarget | undefined; integration?: IntegrationId }) {
  const serverLoaded = use(ServerLoadedPreviews);
  if (!target) return null;
  const Example = serverLoaded[target.key] ?? target.preview.Component;

  return (
    <Suspense fallback={previewFallback}>
      <Example integration={integration} />
    </Suspense>
  );
}

export function KitPreview({ kitId, integration }: { kitId: KitId; integration: IntegrationId }) {
  return <TargetPreview target={kitPreviewTarget(kitId)} integration={integration} />;
}

export function KitChoicePreview({
  kitId,
  choiceId,
  kind,
  integration,
}: {
  kitId: KitId;
  choiceId: string;
  kind: KitChoiceKind;
  integration: IntegrationId;
}) {
  return <TargetPreview target={kitChoicePreviewTarget(kitId, kind, choiceId)} integration={integration} />;
}

export function BlockPreview({ blockId, integration }: { blockId: BlockId; integration: IntegrationId }) {
  return <TargetPreview target={blockPreviewTarget(blockId)} integration={integration} />;
}

export function UtilPreview({ utilId }: { utilId: UtilId }) {
  return <TargetPreview target={utilPreviewTarget(utilId)} />;
}

export function ComponentPreview({ componentId }: { componentId: ComponentId }) {
  return <TargetPreview target={componentPreviewTarget(componentId)} />;
}

export function KitExamplePreview({ kitId, exampleId }: { kitId: KitId; exampleId: string }) {
  return <TargetPreview target={kitExamplePreviewTarget(kitId, exampleId)} />;
}

export function ComponentExamplePreview({ componentId, exampleId }: { componentId: ComponentId; exampleId: string }) {
  return <TargetPreview target={componentExamplePreviewTarget(componentId, exampleId)} />;
}

export function CatalogGalleryItemPreview({ item, integration }: { item: CatalogGalleryItem; integration: IntegrationId }) {
  if (item.kind === "kit") return <KitPreview kitId={item.id} integration={integration} />;
  if (item.previewExampleId) return <ComponentExamplePreview componentId={item.id} exampleId={item.previewExampleId} />;
  return <ComponentPreview componentId={item.id} />;
}
