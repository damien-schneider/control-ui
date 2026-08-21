// Generated from src/registry/sources/control-ui/recipes/dropzone.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const dropzoneKnobs = [
  "--cui-dropzone-surface-radius",
  "--cui-dropzone-surface-foreground",
  "--cui-dropzone-surface-border-color",
  "--cui-dropzone-accept-border-color",
  "--cui-dropzone-reject-border-color",
  "--cui-dropzone-overlay-background",
] as const;
export type DropzoneKnobStyle = Partial<Record<(typeof dropzoneKnobs)[number], string>>;
