// Generated from src/registry/sources/control-ui/recipes/environment-variables.css by scripts/gen-knob-contracts.ts — run `bun run sync:knobs`.
export const environmentVariablesKnobs = [
  "--cui-environment-variables-title-foreground",
  "--cui-environment-variables-meta-foreground",
  "--cui-environment-variables-error-foreground",
  "--cui-environment-variables-message-background",
  "--cui-environment-variables-message-foreground",
  "--cui-environment-variables-message-border-color",
] as const;
export type EnvironmentVariablesKnobStyle = Partial<Record<(typeof environmentVariablesKnobs)[number], string>>;
