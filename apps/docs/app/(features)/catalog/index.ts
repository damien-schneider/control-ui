/*
 * Docs catalog: static typed entries (guides/components/blocks/primitives/hooks/utils/skins) that pages/sidebar/registry read; split mirrors sidebar grouping.
 * Files: shared.ts (types+helpers), skins.ts (SKIN axis), guides/components/blocks/primitives.ts, hooks-utils.ts (hooks+utils+manifest paths).
 */
import { blockEntries } from "./blocks";
import { componentEntries } from "./components";
import { extensionEntries } from "./extensions";
import { guideEntries } from "./guides";
import { hookEntries, utilEntries } from "./hooks-utils";
import { primitiveEntries } from "./primitives";

export const catalogEntries = [
  ...guideEntries,
  ...componentEntries,
  ...blockEntries,
  ...primitiveEntries,
  ...hookEntries,
  ...utilEntries,
  ...extensionEntries,
] as const;
