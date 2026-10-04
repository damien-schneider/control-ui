"use client";

import { Suspense } from "react";

import { blockEntries } from "@/app/(features)/catalog/blocks";
import { componentEntries } from "@/app/(features)/catalog/components";
import { utilEntries } from "@/app/(features)/catalog/hooks-utils";
import { primitiveEntries } from "@/app/(features)/catalog/primitives";
import type { BlockId, ComponentId, IntegrationId, PrimitiveId, UtilId } from "@/app/(features)/model/types";
import { Skeleton } from "@/components/control-ui/ui/skeleton";

const previewFallback = <Skeleton className="min-h-40 w-full self-stretch" />;

export function Preview({ componentId, integration }: { componentId: ComponentId; integration: IntegrationId }) {
  const entry = componentEntries.find((item) => item.id === componentId);
  const Example = entry?.preview.Component;

  return Example ? (
    <Suspense fallback={previewFallback}>
      <Example integration={integration} />
    </Suspense>
  ) : null;
}

export function ComponentChoicePreview({
  componentId,
  choiceId,
  kind,
  integration,
}: {
  componentId: ComponentId;
  choiceId: string;
  kind: "alternative" | "variant";
  integration: IntegrationId;
}) {
  const entry = componentEntries.find((item) => item.id === componentId);
  const choices = kind === "alternative" && entry && "alternatives" in entry ? entry.alternatives : undefined;
  const variants = kind === "variant" && entry && "variants" in entry ? entry.variants : undefined;
  const Example = (choices ?? variants)?.find((item) => item.id === choiceId)?.preview.Component;

  return Example ? (
    <Suspense fallback={previewFallback}>
      <Example integration={integration} />
    </Suspense>
  ) : null;
}

export function BlockPreview({ blockId, integration }: { blockId: BlockId; integration: IntegrationId }) {
  const entry = blockEntries.find((item) => item.id === blockId);
  const Example = entry?.preview.Component;

  return Example ? (
    <Suspense fallback={previewFallback}>
      <Example integration={integration} />
    </Suspense>
  ) : null;
}

export function UtilPreview({ utilId }: { utilId: UtilId }) {
  const entry = utilEntries.find((item) => item.id === utilId);
  const Example = entry && "preview" in entry ? entry.preview.Component : undefined;

  return Example ? (
    <Suspense fallback={previewFallback}>
      <Example />
    </Suspense>
  ) : null;
}

export function PrimitivePreview({ primitiveId }: { primitiveId: PrimitiveId }) {
  const entry = primitiveEntries.find((item) => item.id === primitiveId);
  const Example = entry?.preview.Component;

  return Example ? (
    <Suspense fallback={previewFallback}>
      <Example />
    </Suspense>
  ) : null;
}

export function ComponentExamplePreview({ componentId, exampleId }: { componentId: ComponentId; exampleId: string }) {
  const entry = componentEntries.find((item) => item.id === componentId);
  const preview = entry && "additionalPreviews" in entry ? entry.additionalPreviews.find((item) => item.id === exampleId) : undefined;
  const Example = preview?.preview.Component;

  return Example ? (
    <Suspense fallback={previewFallback}>
      <Example />
    </Suspense>
  ) : null;
}

export function PrimitiveExamplePreview({ primitiveId, exampleId }: { primitiveId: PrimitiveId; exampleId: string }) {
  const entry = primitiveEntries.find((item) => item.id === primitiveId);
  const preview = entry && "additionalPreviews" in entry ? entry.additionalPreviews.find((item) => item.id === exampleId) : undefined;
  const Example = preview?.preview.Component;

  return Example ? (
    <Suspense fallback={previewFallback}>
      <Example />
    </Suspense>
  ) : null;
}
