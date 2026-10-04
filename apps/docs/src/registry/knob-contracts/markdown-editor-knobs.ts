// Generated from src/registry/sources/control-ui/recipes/markdown-editor.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const markdownEditorKnobs = [
  "--cui-markdown-editor-background",
  "--cui-markdown-editor-foreground",
  "--cui-markdown-editor-border-color",
  "--cui-markdown-editor-radius",
  "--cui-markdown-editor-padding",
  "--cui-markdown-editor-min-height",
  "--cui-markdown-editor-max-height",
  "--cui-markdown-editor-gap",
  "--cui-markdown-editor-muted-foreground",
  "--cui-markdown-editor-code-background",
  "--cui-markdown-editor-border-width",
] as const;
export type MarkdownEditorKnobStyle = Partial<Record<(typeof markdownEditorKnobs)[number], string>>;
