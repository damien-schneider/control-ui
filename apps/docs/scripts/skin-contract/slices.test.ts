import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import type { ContrastAnatomyArtifact } from "../contrast-anatomy/model";
import { publicPayloadPath, publicPayloads } from "../public-payloads";
import type { SkinContract } from "./model";
import { type ContractFamilySlice, type ContractSliceIndex, type ContrastFamilySlice, contractSlices, probeFamily } from "./slices";

const contract: SkinContract = JSON.parse(readFileSync(publicPayloadPath(publicPayloads.skinContract), "utf8"));
const anatomy: ContrastAnatomyArtifact = JSON.parse(readFileSync(publicPayloadPath(publicPayloads.contrastAnatomy), "utf8"));
const slices = contractSlices(contract, anatomy);
const parsed = new Map(slices.map((slice) => [slice.path, JSON.parse(slice.content)]));

const index: ContractSliceIndex = parsed.get("public/r/contract/index.json");
const families = Object.keys(index.families);
const familySlice = (family: string): ContractFamilySlice => parsed.get(`public/r/contract/${family}.json`);
const contrastSlice = (family: string): ContrastFamilySlice => parsed.get(`public/r/contract/${family}.contrast.json`);
const owners = new Map(Object.entries(contract.knobs).flatMap(([family, knobs]) => knobs.map((knob) => [knob.name, family] as const)));

describe("contract slices", () => {
  test("every knob family and every part family has a slice", () => {
    const partFamilies = Object.values(contract.scopes).flatMap((scope) =>
      Object.values(scope.parts).flatMap((part) => (part.family ? [part.family] : [])),
    );
    for (const family of [...Object.keys(contract.knobs), ...partFamilies]) expect(families).toContain(family);
  });

  test("the index keys are exactly the emitted slice pairs", () => {
    expect(slices.map((slice) => slice.path).sort()).toEqual(
      [
        "public/r/contract/index.json",
        ...families.flatMap((family) => [`public/r/contract/${family}.json`, `public/r/contract/${family}.contrast.json`]),
      ].sort(),
    );
  });

  test("a slice carries its family's knobs verbatim", () => {
    for (const family of families) expect(familySlice(family).knobs).toEqual(contract.knobs[family] ?? []);
  });

  test("a familied part lands in its own family", () => {
    for (const family of families) {
      for (const parts of Object.values(familySlice(family).parts)) {
        for (const part of Object.values(parts)) if (part.family) expect(part.family).toBe(family);
      }
    }
  });

  test("every part lands in some slice", () => {
    const routed = new Set(
      families.flatMap((family) =>
        Object.entries(familySlice(family).parts).flatMap(([scope, parts]) => Object.keys(parts).map((part) => `${scope}:${part}`)),
      ),
    );
    const declared = Object.entries(contract.scopes).flatMap(([scope, value]) =>
      Object.keys(value.parts).map((part) => `${scope}:${part}`),
    );
    expect(declared.filter((part) => !routed.has(part))).toEqual([]);
  });

  test("probes are split by family and every anatomy index round-trips", () => {
    expect(families.reduce((total, family) => total + contrastSlice(family).probes.length, 0)).toBe(anatomy.probes.length);
    for (const probe of anatomy.probes) {
      const family = probeFamily(owners, probe);
      expect(family, `${Object.values(probe.knobs).join(", ")} owns no family`).toBeDefined();
      const slice = contrastSlice(family as string);
      expect(slice.anatomies[slice.probes[0].anatomy]).toBeDefined();
      const matched = slice.probes.filter(
        (candidate) => JSON.stringify(slice.anatomies[candidate.anatomy]) === JSON.stringify(probe.anatomy),
      );
      expect(matched.length).toBeGreaterThan(0);
    }
  });

  test("uncovered knobs are reported by the family that owns them", () => {
    expect(families.flatMap((family) => familySlice(family).uncovered).sort()).toEqual([...anatomy.uncovered].sort());
    for (const family of families) {
      for (const knob of familySlice(family).uncovered) expect(knob).toStartWith(`--cui-${family}-`);
    }
  });

  test("the index counts match the slices it points at", () => {
    for (const [family, summary] of Object.entries(index.families)) {
      expect(summary.knobs).toBe(familySlice(family).knobs.length);
      expect(summary.probes).toBe(contrastSlice(family).probes.length);
      expect(summary.registryItems).toEqual(familySlice(family).registryItems);
    }
  });
});
