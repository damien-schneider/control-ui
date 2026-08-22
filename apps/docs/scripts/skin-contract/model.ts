import type { PopupPart } from "../../src/registry/sources/control-ui/surface-variants";

export type ContractState = {
  attribute: string;
  source: "control-ui" | "external";
  valueKind: "enum" | "open" | "presence";
  values: string[];
};

export type ContractKnob = {
  name: string;
  syntax: string;
  initialValue: string;
  defaultValue: string;
};

export type ContractPart = {
  context?: Record<string, string>;
  family?: string;
  registryItems: string[];
  states: ContractState[];
};

export type ContractScope = {
  parts: Record<string, ContractPart>;
  registryItems: string[];
};

export type AnatomyReference = { scope: string; part: string };

// The `data-surface` families part can declare; single list so collector's guard, its mutable
// accumulator, and emitted contract can never drift apart.
export const skinSurfaceFamilies = ["floating", "modal", "panel"] as const;
export type SkinSurfaceFamily = (typeof skinSurfaceFamilies)[number];

export type SkinContract = {
  version: 7;
  selectorPattern: string;
  registryItemMapping: Record<string, string[]>;
  scopes: Record<string, ContractScope>;
  knobs: Record<string, ContractKnob[]>;
  adornments: Record<string, Record<string, { context: Record<string, string> }>>;
  semanticFamilies: {
    popup: Record<PopupPart, AnatomyReference[]>;
    controls: AnatomyReference[];
    surfaces: Record<SkinSurfaceFamily, AnatomyReference[]>;
  };
  externalStateAttributes: string[];
};

export type ThemeContractArtifact = {
  version: 1;
  tokens: Array<{ name: string; group: string; tier: string; description: string }>;
};
