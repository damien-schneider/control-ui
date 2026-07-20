import type { SkinPopupPart } from "../../src/registry/skin";

export type ContractState = {
  attribute: string;
  source: "control-ui" | "external";
  valueKind: "enum" | "open" | "presence";
  values: string[];
};

export type ContractPart = {
  context?: Record<string, string>;
  registryItems: string[];
  states: ContractState[];
};

export type ContractScope = {
  parts: Record<string, ContractPart>;
  registryItems: string[];
};

export type AnatomyReference = { scope: string; part: string };

export type SkinContract = {
  version: 5;
  selectorPattern: string;
  registryItemMapping: Record<string, string[]>;
  scopes: Record<string, ContractScope>;
  paints: Record<string, Record<string, { context: Record<string, string> }>>;
  adornments: Record<string, Record<string, { context: Record<string, string> }>>;
  semanticFamilies: {
    popup: Record<SkinPopupPart, AnatomyReference[]>;
    controls: AnatomyReference[];
    surfaces: Record<"floating" | "modal" | "panel", AnatomyReference[]>;
  };
  externalStateAttributes: string[];
};

export type ThemeContractArtifact = {
  version: 1;
  tokens: Array<{ name: string; group: string; tier: string; description: string }>;
};
