import path from "node:path";

/**
 * The contract payloads public/r holds that the shadcn item build does not produce. Each is written by its own
 * generator, so the build's prune step and the validator both read this list rather than restating the names.
 */
export const publicPayloads = {
  agentIndex: "agent-index.json",
  skinContract: "skin-contract.json",
  themeContract: "theme-contract.json",
  contrastAnatomy: "contrast-anatomy.json",
  setupPrompt: "setup-prompt.md",
  controlUiSkill: "control-ui-skill.md",
} as const;

/** Per-family contract slices live one directory down, so the item build prunes around it instead of through it. */
export const contractDir = "contract";

export const publicPayloadPath = (payload: string) => path.join("public/r", payload);

export const contractSlicePath = (slice: string) => publicPayloadPath(path.join(contractDir, `${slice}.json`));

export const contractSliceUrl = (slice: string) => `/r/${contractDir}/${slice}.json`;
