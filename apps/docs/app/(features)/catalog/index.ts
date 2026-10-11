/*
 * Docs catalog: static typed entries (guides/components/kits/blocks/hooks/utils/skins) that pages/sidebar/registry read; split mirrors sidebar grouping.
 * Files: shared.ts (types+helpers), skins.ts (SKIN axis), guides/components/kits/blocks.ts, hooks-utils.ts (hooks+utils+manifest paths).
 */
import { blockEntries } from "./blocks";
import { componentEntries } from "./components";
import { extensionEntries } from "./extensions";
import { guideEntries } from "./guides";
import { hookEntries, utilEntries } from "./hooks-utils";
import { kitEntries } from "./kits";

export const catalogEntries = [
  ...guideEntries,
  ...kitEntries,
  ...blockEntries,
  ...componentEntries,
  ...hookEntries,
  ...utilEntries,
  ...extensionEntries,
] as const;
