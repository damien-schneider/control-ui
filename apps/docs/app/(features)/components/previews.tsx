"use client";

import { Suspense } from "react";

import { blockEntries } from "@/app/(features)/catalog/blocks";
import { componentEntries } from "@/app/(features)/catalog/components";
import { utilEntries } from "@/app/(features)/catalog/hooks-utils";
import { primitiveEntries } from "@/app/(features)/catalog/primitives";
import type { BlockId, ComponentId, IntegrationId, PrimitiveId, UtilId } from "@/app/(features)/model/types";

export function Preview({ componentId, integration }: { componentId: ComponentId; integration: IntegrationId }) {
  const entry = componentEntries.find((item) => item.id === componentId);
  const Example = entry?.preview.Component;

  return Example ? (
    <Suspense fallback={null}>
      <Example integration={integration} />
    </Suspense>
  ) : null;
}

// Usage-version preview: resolves the picked version's own lazy example inside a component's versions family.
export function ComponentVersionPreview({
  componentId,
  versionId,
  integration,
}: {
  componentId: ComponentId;
  versionId: string;
  integration: IntegrationId;
}) {
  const entry = componentEntries.find((item) => item.id === componentId);
  const version = entry && "versions" in entry ? entry.versions.find((item) => item.id === versionId) : undefined;
  const Example = version?.preview.Component;

  return Example ? (
    <Suspense fallback={null}>
      <Example integration={integration} />
    </Suspense>
  ) : null;
}

export function BlockPreview({ blockId, integration }: { blockId: BlockId; integration: IntegrationId }) {
  const entry = blockEntries.find((item) => item.id === blockId);
  const Example = entry?.preview.Component;

  return Example ? (
    <Suspense fallback={null}>
      <Example integration={integration} />
    </Suspense>
  ) : null;
}

export function UtilPreview({ utilId }: { utilId: UtilId }) {
  const entry = utilEntries.find((item) => item.id === utilId);
  const Example = entry && "preview" in entry ? entry.preview.Component : undefined;

  return Example ? (
    <Suspense fallback={null}>
      <Example />
    </Suspense>
  ) : null;
}

export function PrimitivePreview({ primitiveId }: { primitiveId: PrimitiveId }) {
  const entry = primitiveEntries.find((item) => item.id === primitiveId);
  const Example = entry?.preview.Component;

  return Example ? (
    <Suspense fallback={null}>
      <Example />
    </Suspense>
  ) : null;
}

export function ComponentExamplePreview({ componentId, exampleId }: { componentId: ComponentId; exampleId: string }) {
  const entry = componentEntries.find((item) => item.id === componentId);
  const preview = entry && "additionalPreviews" in entry ? entry.additionalPreviews.find((item) => item.id === exampleId) : undefined;
  const Example = preview?.preview.Component;

  return Example ? (
    <Suspense fallback={null}>
      <Example />
    </Suspense>
  ) : null;
}

export function PrimitiveExamplePreview({ primitiveId, exampleId }: { primitiveId: PrimitiveId; exampleId: string }) {
  const entry = primitiveEntries.find((item) => item.id === primitiveId);
  const preview = entry && "additionalPreviews" in entry ? entry.additionalPreviews.find((item) => item.id === exampleId) : undefined;
  const Example = preview?.preview.Component;

  return Example ? (
    <Suspense fallback={null}>
      <Example />
    </Suspense>
  ) : null;
}
