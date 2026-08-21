// Generated from src/registry/sources/control-ui/recipes/code-diff.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const codeDiffKnobs = [
  "--cui-code-diff-radius",
  "--cui-code-diff-shadow",
  "--cui-code-diff-background",
  "--cui-code-diff-border-color",
  "--cui-code-diff-foreground",
  "--cui-code-diff-add-background",
  "--cui-code-diff-del-background",
  "--cui-code-diff-expand-button-radius",
  "--cui-code-diff-expand-button-background",
  "--cui-code-diff-expand-button-foreground",
  "--cui-code-diff-expand-button-shadow",
  "--cui-code-diff-expand-button-hover-background",
  "--cui-code-diff-expand-button-hover-foreground",
] as const;
export type CodeDiffKnobStyle = Partial<Record<(typeof codeDiffKnobs)[number], string>>;
