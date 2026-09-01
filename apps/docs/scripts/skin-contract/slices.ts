import type { ContrastAnatomyArtifact, ContrastAnatomyNode, ContrastProbe } from "../contrast-anatomy/model";
import { contractSlicePath, contractSliceUrl } from "../public-payloads";
import { type ContractKnob, type ContractPart, type SkinContract, sortRecord } from "./model";

/** One paint family's slice of the contract: what an agent restyling that family has to read, and nothing else. */
export type ContractFamilySlice = {
  version: SkinContract["version"];
  family: string;
  selectorPattern: string;
  registryItems: string[];
  knobs: ContractKnob[];
  parts: Record<string, Record<string, ContractPart>>;
  adornments: Record<string, Record<string, { context: Record<string, string> }>>;
  uncovered: string[];
  contrast: string;
};

/** The family's probes with anatomies deduped by index: the same ancestor chain repeats across hundreds of probes. */
export type ContrastFamilySlice = {
  version: ContrastAnatomyArtifact["version"];
  family: string;
  anatomies: ContrastAnatomyNode[][];
  probes: Array<{ knobs: ContrastProbe["knobs"]; anatomy: number; rendersText: boolean; state: boolean }>;
};

export type ContractSliceIndex = {
  version: SkinContract["version"];
  selectorPattern: string;
  slice: string;
  contrast: string;
  families: Record<string, { registryItems: string[]; knobs: number; probes: number }>;
};

/**
 * A part without `data-control-family` is painted by whatever families its scope carries, so it belongs to each of
 * them rather than to none; a scope carrying no family at all is its own, which is what keeps every part routed.
 */
function familiesByScope(contract: SkinContract): Map<string, string[]> {
  return new Map(
    Object.entries(contract.scopes).map(([scopeName, scope]) => {
      const families = [...new Set(Object.values(scope.parts).flatMap((part) => (part.family ? [part.family] : [])))].sort();
      return [scopeName, families.length > 0 ? families : [scopeName]];
    }),
  );
}

type RoutedParts = {
  parts: Map<string, Record<string, Record<string, ContractPart>>>;
  registryItems: Map<string, Set<string>>;
};

function partRoutes(contract: SkinContract, scopeFamilies: Map<string, string[]>) {
  return Object.entries(contract.scopes).flatMap(([scope, value]) =>
    Object.entries(value.parts).flatMap(([name, part]) =>
      (part.family ? [part.family] : (scopeFamilies.get(scope) ?? [])).map((family) => ({ family, scope, name, part })),
    ),
  );
}

function routeParts(contract: SkinContract, scopeFamilies: Map<string, string[]>, families: string[]): RoutedParts {
  const routed: RoutedParts = {
    parts: new Map(families.map((family) => [family, {}])),
    registryItems: new Map(families.map((family) => [family, new Set<string>()])),
  };
  for (const { family, scope, name, part } of partRoutes(contract, scopeFamilies)) {
    const scopes = routed.parts.get(family);
    if (!scopes) throw new Error(`${scope}:${name} names family ${family}, which has no slice`);
    scopes[scope] = { ...scopes[scope], [name]: part };
    for (const item of part.registryItems) routed.registryItems.get(family)?.add(item);
  }
  return routed;
}

function knobOwners(contract: SkinContract): Map<string, string> {
  const owners = new Map<string, string>();
  for (const [family, knobs] of Object.entries(contract.knobs)) for (const knob of knobs) owners.set(knob.name, family);
  return owners;
}

function routeUncovered(owners: Map<string, string>, families: string[], uncovered: readonly string[]): Map<string, string[]> {
  const routed = new Map<string, string[]>(families.map((family) => [family, []]));
  for (const knob of uncovered) {
    const family = owners.get(knob);
    if (!family) throw new Error(`${knob} is reported uncovered but belongs to no knob family`);
    routed.get(family)?.push(knob);
  }
  return routed;
}

/** A family can span several recipe files, so the knob a probe paints with names its owner; the file name does not. */
export function probeFamily(owners: Map<string, string>, probe: ContrastProbe): string | undefined {
  return Object.values(probe.knobs).flatMap((knob) => owners.get(knob) ?? [])[0];
}

function routeProbes(owners: Map<string, string>, families: string[], probes: readonly ContrastProbe[]): Map<string, ContrastFamilySlice> {
  const routed = new Map<string, ContrastFamilySlice>(
    families.map((family) => [family, { version: 1, family, anatomies: [], probes: [] }]),
  );
  for (const probe of probes) {
    const family = probeFamily(owners, probe);
    const slice = family ? routed.get(family) : undefined;
    if (!slice) throw new Error(`probe painting ${Object.values(probe.knobs).join(", ")} matches no knob family`);
    const anatomyKey = JSON.stringify(probe.anatomy);
    const known = slice.anatomies.findIndex((candidate) => JSON.stringify(candidate) === anatomyKey);
    const anatomy = known === -1 ? slice.anatomies.push(probe.anatomy) - 1 : known;
    slice.probes.push({ knobs: probe.knobs, anatomy, rendersText: probe.rendersText, state: probe.state });
  }
  return routed;
}

function adornmentsFor(contract: SkinContract, parts: ContractFamilySlice["parts"]): ContractFamilySlice["adornments"] {
  return sortRecord(
    Object.fromEntries(
      Object.entries(contract.adornments).flatMap(([scope, adorned]) => {
        const kept = Object.entries(adorned).filter(([part]) => part in (parts[scope] ?? {}));
        return kept.length > 0 ? [[scope, sortRecord(Object.fromEntries(kept))]] : [];
      }),
    ),
  );
}

export function contractSlices(contract: SkinContract, anatomy?: ContrastAnatomyArtifact): Array<{ path: string; content: string }> {
  const scopeFamilies = familiesByScope(contract);
  const families = [...new Set([...Object.keys(contract.knobs), ...[...scopeFamilies.values()].flat()])].sort();
  const routed = routeParts(contract, scopeFamilies, families);
  const owners = knobOwners(contract);
  const uncovered = routeUncovered(owners, families, anatomy?.uncovered ?? []);
  const contrast = routeProbes(owners, families, anatomy?.probes ?? []);

  const emit = (path: string, value: unknown) => ({ path, content: `${JSON.stringify(value, null, 2)}\n` });
  const summaries: ContractSliceIndex["families"] = {};
  const targets = families.flatMap((family) => {
    const scopes = sortRecord(routed.parts.get(family) ?? {});
    const parts = Object.fromEntries(Object.entries(scopes).map(([scope, scopeParts]) => [scope, sortRecord(scopeParts, true)]));
    const knobs = contract.knobs[family] ?? [];
    const probes = contrast.get(family) ?? { version: 1 as const, family, anatomies: [], probes: [] };
    const registryItems = [...(routed.registryItems.get(family) ?? [])].sort();
    summaries[family] = { registryItems, knobs: knobs.length, probes: probes.probes.length };
    const slice: ContractFamilySlice = {
      version: contract.version,
      family,
      selectorPattern: contract.selectorPattern,
      registryItems,
      knobs,
      parts,
      adornments: adornmentsFor(contract, parts),
      uncovered: (uncovered.get(family) ?? []).sort(),
      contrast: contractSliceUrl(`${family}.contrast`),
    };
    return [emit(contractSlicePath(family), slice), emit(contractSlicePath(`${family}.contrast`), probes)];
  });

  const index: ContractSliceIndex = {
    version: contract.version,
    selectorPattern: contract.selectorPattern,
    slice: contractSliceUrl("<family>"),
    contrast: contractSliceUrl("<family>.contrast"),
    families: summaries,
  };
  return [emit(contractSlicePath("index"), index), ...targets];
}
