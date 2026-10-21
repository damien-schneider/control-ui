import type { ComponentType } from "react";
import { blockEntries } from "@/app/(features)/catalog/blocks";
import { componentEntries } from "@/app/(features)/catalog/components";
import { utilEntries } from "@/app/(features)/catalog/hooks-utils";
import { kitEntries } from "@/app/(features)/catalog/kits";
import type { CatalogPreview, IntegrationPreviewProps } from "@/app/(features)/catalog/shared";
import type { BlockId, ComponentId, KitId, UtilId } from "@/app/(features)/model/types";

export type PreviewTarget = { key: string; preview: CatalogPreview };
export type KitChoiceKind = "alternative" | "variant";
export type LoadedPreviews = Readonly<Record<string, ComponentType<IntegrationPreviewProps>>>;

function previewTarget(key: string, preview: CatalogPreview | undefined): PreviewTarget | undefined {
  return preview ? { key, preview } : undefined;
}

function componentEntry(componentId: ComponentId) {
  return componentEntries.find((item) => item.id === componentId);
}

function kitEntry(kitId: KitId) {
  return kitEntries.find((item) => item.id === kitId);
}

export function componentExampleIds(componentId: ComponentId) {
  const entry = componentEntry(componentId);
  return entry && "additionalPreviews" in entry ? entry.additionalPreviews.map((example) => example.id) : [];
}

export function kitExampleIds(kitId: KitId) {
  const entry = kitEntry(kitId);
  return entry && "additionalPreviews" in entry ? entry.additionalPreviews.map((example) => example.id) : [];
}

export function kitChoices(kitId: KitId): { kind: KitChoiceKind; id: string }[] {
  const entry = kitEntry(kitId);
  if (entry && "alternatives" in entry) return entry.alternatives.map((choice) => ({ kind: "alternative", id: choice.id }));
  if (entry && "variants" in entry) return entry.variants.map((choice) => ({ kind: "variant", id: choice.id }));
  return [];
}

export function componentPreviewTarget(componentId: ComponentId) {
  return previewTarget(`component/${componentId}`, componentEntry(componentId)?.preview);
}

export function componentExamplePreviewTarget(componentId: ComponentId, exampleId: string) {
  const entry = componentEntry(componentId);
  const example = entry && "additionalPreviews" in entry ? entry.additionalPreviews.find((item) => item.id === exampleId) : undefined;
  return previewTarget(`component/${componentId}/${exampleId}`, example?.preview);
}

export function kitPreviewTarget(kitId: KitId) {
  return previewTarget(`kit/${kitId}`, kitEntry(kitId)?.preview);
}

export function kitChoicePreviewTarget(kitId: KitId, kind: KitChoiceKind, choiceId: string) {
  const entry = kitEntry(kitId);
  const alternatives = kind === "alternative" && entry && "alternatives" in entry ? entry.alternatives : undefined;
  const variants = kind === "variant" && entry && "variants" in entry ? entry.variants : undefined;
  const choice = (alternatives ?? variants)?.find((item) => item.id === choiceId);
  return previewTarget(`kit/${kitId}/${kind}/${choiceId}`, choice?.preview);
}

export function kitExamplePreviewTarget(kitId: KitId, exampleId: string) {
  const entry = kitEntry(kitId);
  const example = entry && "additionalPreviews" in entry ? entry.additionalPreviews.find((item) => item.id === exampleId) : undefined;
  return previewTarget(`kit/${kitId}/${exampleId}`, example?.preview);
}

export function blockPreviewTarget(blockId: BlockId) {
  return previewTarget(`block/${blockId}`, blockEntries.find((item) => item.id === blockId)?.preview);
}

export function utilPreviewTarget(utilId: UtilId) {
  const entry = utilEntries.find((item) => item.id === utilId);
  return previewTarget(`util/${utilId}`, entry && "preview" in entry ? entry.preview : undefined);
}

export function allPreviewTargets() {
  return [
    ...componentEntries.flatMap((entry) => [
      componentPreviewTarget(entry.id),
      ...componentExampleIds(entry.id).map((exampleId) => componentExamplePreviewTarget(entry.id, exampleId)),
    ]),
    ...kitEntries.flatMap((entry) => [
      kitPreviewTarget(entry.id),
      ...kitChoices(entry.id).map((choice) => kitChoicePreviewTarget(entry.id, choice.kind, choice.id)),
      ...kitExampleIds(entry.id).map((exampleId) => kitExamplePreviewTarget(entry.id, exampleId)),
    ]),
    ...blockEntries.map((entry) => blockPreviewTarget(entry.id)),
    ...utilEntries.map((entry) => utilPreviewTarget(entry.id)),
  ].filter((target) => target !== undefined);
}
