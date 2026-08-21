// Generated from src/registry/sources/control-ui/recipes/tree.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const treeKnobs = [
  "--cui-tree-item-trigger-radius",
  "--cui-tree-item-trigger-foreground",
  "--cui-tree-item-trigger-hover-background",
  "--cui-tree-item-trigger-hover-foreground",
  "--cui-tree-item-trigger-selected-background",
  "--cui-tree-item-trigger-selected-foreground",
  "--cui-tree-item-trigger-font-size",
  "--cui-tree-item-trigger-selected-font-weight",
] as const;
export type TreeKnobStyle = Partial<Record<(typeof treeKnobs)[number], string>>;
