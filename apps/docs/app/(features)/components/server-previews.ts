import "server-only";

import { defaultHeroSceneId } from "@/app/(features)/home/showcase";
import type { BlockId, ComponentId, ExtensionId, KitId, UtilId } from "@/app/(features)/model/types";
import { extensionDemoComponentId } from "@/app/(features)/page-templates/extension-demo-ids";
import { themePreviewSections } from "@/components/theme-drawer/preview-sections";
import { SKIN_CATEGORY, type ThemeCategoryId } from "@/components/theme-drawer/theme-categories";
import { previewReferences } from "./generated-preview-references";
import {
  blockPreviewTarget,
  componentExampleIds,
  componentExamplePreviewTarget,
  componentPreviewTarget,
  kitChoicePreviewTarget,
  kitChoices,
  kitExampleIds,
  kitExamplePreviewTarget,
  kitPreviewTarget,
  type LoadedPreviews,
  type PreviewTarget,
  utilPreviewTarget,
} from "./preview-targets";

function previewsFor(targets: readonly (PreviewTarget | undefined)[]): LoadedPreviews {
  return Object.fromEntries(
    targets.flatMap((target) => {
      const reference = target && previewReferences[target.key];
      return reference ? [[target.key, reference]] : [];
    }),
  );
}

function extensionDemoTargets(extensionIds: readonly ExtensionId[]) {
  return extensionIds.map((extensionId) => {
    const componentId = extensionDemoComponentId(extensionId);
    return componentId ? componentPreviewTarget(componentId) : undefined;
  });
}

export function componentPagePreviews(componentId: ComponentId, extensionIds: readonly ExtensionId[]) {
  return previewsFor([
    componentPreviewTarget(componentId),
    ...componentExampleIds(componentId).map((exampleId) => componentExamplePreviewTarget(componentId, exampleId)),
    ...extensionDemoTargets(extensionIds),
  ]);
}

export function kitPagePreviews(kitId: KitId, extensionIds: readonly ExtensionId[]) {
  const defaultChoice = kitChoices(kitId)[0];
  return previewsFor([
    defaultChoice ? kitChoicePreviewTarget(kitId, defaultChoice.kind, defaultChoice.id) : kitPreviewTarget(kitId),
    ...kitExampleIds(kitId).map((exampleId) => kitExamplePreviewTarget(kitId, exampleId)),
    ...extensionDemoTargets(extensionIds),
  ]);
}

export function templatePagePreviews(blockId: BlockId) {
  return previewsFor([blockPreviewTarget(blockId)]);
}

export function utilPagePreviews(utilId: UtilId) {
  return previewsFor([utilPreviewTarget(utilId)]);
}

export function extensionPagePreviews(extensionId: ExtensionId) {
  return previewsFor(extensionDemoTargets([extensionId]));
}

export function homePreviews() {
  return previewsFor([blockPreviewTarget(defaultHeroSceneId)]);
}

export function themeEditorPreviews(category: ThemeCategoryId = SKIN_CATEGORY) {
  return previewsFor(
    themePreviewSections(category).map((section) => {
      if (section.kind === "component") return componentPreviewTarget(section.componentId);
      if (section.kind === "application") return blockPreviewTarget(section.blockId);
      return undefined;
    }),
  );
}
