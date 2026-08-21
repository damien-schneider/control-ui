// Generated from src/registry/sources/control-ui/recipes/markdown.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const markdownKnobs = [
  "--cui-markdown-foreground",
  "--cui-markdown-blockquote-border-color",
  "--cui-markdown-blockquote-foreground",
  "--cui-markdown-inline-code-background",
  "--cui-markdown-inline-code-foreground",
  "--cui-markdown-inline-code-radius",
  "--cui-markdown-link-foreground",
  "--cui-markdown-table-cell-border-color",
  "--cui-markdown-table-header-background",
] as const;
export type MarkdownKnobStyle = Partial<Record<(typeof markdownKnobs)[number], string>>;
