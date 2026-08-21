// Generated from src/registry/sources/control-ui/recipes/code.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const codeKnobs = [
  "--cui-code-radius",
  "--cui-code-background",
  "--cui-code-border-color",
  "--cui-code-shadow",
  "--cui-code-title-foreground",
  "--cui-code-text-foreground",
] as const;
export type CodeKnobStyle = Partial<Record<(typeof codeKnobs)[number], string>>;
