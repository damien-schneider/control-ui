import { practiceSkills } from "@control-ui/skills";
import { blockEntries } from "@/app/(features)/catalog/blocks";
import { componentEntries } from "@/app/(features)/catalog/components";
import { extensionEntries } from "@/app/(features)/catalog/extensions";
import { guideEntries } from "@/app/(features)/catalog/guides";
import { hookEntries, utilEntries } from "@/app/(features)/catalog/hooks-utils";
import { primitiveEntries } from "@/app/(features)/catalog/primitives";
import { skinMetas } from "@/app/(features)/catalog/skins";
import type {
  BlockId,
  ComponentId,
  ExtensionId,
  GuideId,
  HookId,
  PrimitiveId,
  SkillId,
  SkinMetaId,
  UtilId,
} from "@/app/(features)/model/types";

function includesId<T extends string>(ids: readonly T[], value: string): value is T {
  return ids.some((id) => id === value);
}

export const guidePageIds = guideEntries.map((entry) => entry.id);

export const componentPageIds = componentEntries.map((entry) => entry.id);

export const blockPageIds = blockEntries.map((entry) => entry.id);

export const primitivePageIds = primitiveEntries.map((entry) => entry.id);

export const hookPageIds = hookEntries.map((entry) => entry.id);

export const utilPageIds = utilEntries.map((entry) => entry.id);

export const extensionPageIds = extensionEntries.map((entry) => entry.id);

export const skillPageIds = practiceSkills.map((entry) => entry.id);

export const skinPageIds = skinMetas.map((entry) => entry.id);

export function isGuidePageId(value: string): value is GuideId {
  return includesId(guidePageIds, value);
}

export function isComponentPageId(value: string): value is ComponentId {
  return includesId(componentPageIds, value);
}

export function isBlockPageId(value: string): value is BlockId {
  return includesId(blockPageIds, value);
}

export function isPrimitivePageId(value: string): value is PrimitiveId {
  return includesId(primitivePageIds, value);
}

export function isHookPageId(value: string): value is HookId {
  return includesId(hookPageIds, value);
}

export function isUtilPageId(value: string): value is UtilId {
  return includesId(utilPageIds, value);
}

export function isExtensionPageId(value: string): value is ExtensionId {
  return includesId(extensionPageIds, value);
}

export function isSkillPageId(value: string): value is SkillId {
  return includesId(skillPageIds, value);
}

export function isSkinPageId(value: string): value is SkinMetaId {
  return includesId(skinPageIds, value);
}

export function docsPathForPageId(value: string) {
  if (isComponentPageId(value)) return `/ai/${value}`;
  if (isBlockPageId(value)) return `/use-cases/${value}`;
  if (isPrimitivePageId(value)) return `/primitives/${value}`;
  if (isHookPageId(value)) return `/hooks/${value}`;
  if (isUtilPageId(value)) return `/utils/${value}`;
  if (isExtensionPageId(value)) return `/extensions/${value}`;
  if (isSkillPageId(value)) return `/skills/${value}`;
  return undefined;
}
