import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import postcss from "postcss";
import selectorParser from "postcss-selector-parser";
import { controlAttribute, familyAttribute, identityAttribute, isFamilyPartAttribute, slotAttribute } from "./control-anatomy";
import { knobPrefix } from "./knob-contracts/collect";
import { flattenCompound, subjectCompound } from "./selector-bucketing";
import type { SkinContract } from "./skin-contract/model";

export type Anatomy = { family: string; part: string | undefined };

/** A core rule keyed on a bare `[data-control-family]` paints every family at once. */
const EVERY_FAMILY = "*";

const CORE_ROOT = "src/registry/sources/control-ui";
const VAR_REFERENCE = /var\(\s*(--[\w-]+)/g;
const PSEUDO_ELEMENTS = /^(::|:(before|after|first-line|first-letter)$)/;

export const anatomySeparator = "\u0000";

const anatomyKey = ({ family, part }: Anatomy): string => `${family}${anatomySeparator}${part ?? ""}`;

function readVars(value: string): string[] {
  return [...value.matchAll(VAR_REFERENCE)].map((match) => match[1]);
}

/**
 * A recipe that paints from `var(--_local)` still owns the knob the local reads. Without following the
 * indirection every private alias would read as an un-knobbed property and let a skin overpaint it.
 */
function knobsBehindPrivates(root: postcss.Root): Map<string, string[]> {
  const aliases = new Map<string, string[]>();
  root.walkDecls((declaration) => {
    if (declaration.prop.startsWith("--_")) aliases.set(declaration.prop, readVars(declaration.value));
  });
  const resolve = (name: string, seen: Set<string>): string[] => {
    if (!name.startsWith("--_")) return [name];
    if (seen.has(name)) return [];
    seen.add(name);
    return (aliases.get(name) ?? []).flatMap((next) => resolve(next, seen));
  };
  return new Map([...aliases.keys()].map((name) => [name, resolve(name, new Set())]));
}

function familyOwns(knob: string, family: string): boolean {
  return family === EVERY_FAMILY || knob.startsWith(`${knobPrefix}${family}-`);
}

type Compound = selectorParser.Node[];

/** A ::before is a box of its own that no knob reaches, however the part is keyed. */
function isPseudoElement(node: selectorParser.Node): boolean {
  return node.type === "pseudo" && PSEUDO_ELEMENTS.test(node.value);
}

function attributeValue(compound: Compound, name: string): string | undefined {
  const attribute = compound.find((node) => node.type === "attribute" && node.attribute === name);
  return attribute?.type === "attribute" ? attribute.value : undefined;
}

function partAttributeValue(compound: Compound): string | undefined {
  const attribute = compound.find((node) => node.type === "attribute" && isFamilyPartAttribute(node.attribute));
  return attribute?.type === "attribute" ? attribute.value : undefined;
}

/** A valueless `[data-control-ui]` or `[data-control-family]` key reaches every part of every family. */
function keysEveryFamily(compound: Compound): boolean {
  return compound.some((node) => node.type === "attribute" && !node.value && [identityAttribute, familyAttribute].includes(node.attribute));
}

function compoundsOf(selector: string): Compound[] {
  const all: Compound[] = [];
  selectorParser((root) => {
    root.walk((node) => {
      if (node.type !== "selector") return;
      let compound: Compound = [];
      for (const child of node.nodes) {
        if (child.type !== "combinator") {
          compound.push(child);
          continue;
        }
        all.push(compound);
        compound = [];
      }
      all.push(compound);
    });
  }).processSync(selector);
  return all;
}

function createAnatomyOf(contract: SkinContract): (compound: Compound) => Anatomy | undefined {
  const familyOfPart = new Map<string, string>();
  for (const [scope, definition] of Object.entries(contract.scopes)) {
    for (const [part, details] of Object.entries(definition.parts)) {
      if (details.family) familyOfPart.set(`${scope}/${part}`, details.family);
    }
  }
  const semanticPartOfPart = new Map<string, string>();
  for (const [semanticPart, sites] of Object.entries(contract.semanticFamilies.popup)) {
    for (const site of sites) semanticPartOfPart.set(`popup|${site.scope}/${site.part}`, semanticPart);
  }

  const partOf = (compound: Compound, family: string, site: string | undefined): string | undefined => {
    // `[data-control="true"]` is how a recipe keys the control box itself, which the skins key as the root slot.
    const controlBox = attributeValue(compound, controlAttribute) === "true" ? "root" : undefined;
    const semanticPart = site ? semanticPartOfPart.get(`${family}|${site}`) : undefined;
    return partAttributeValue(compound) ?? semanticPart ?? attributeValue(compound, slotAttribute) ?? controlBox;
  };

  const anatomyOf = (compound: Compound): Anatomy | undefined => {
    if (compound.some(isPseudoElement)) return undefined;
    const scope = attributeValue(compound, identityAttribute);
    const slot = attributeValue(compound, slotAttribute);
    const site = scope && slot ? `${scope}/${slot}` : undefined;
    const family = attributeValue(compound, familyAttribute) ?? (site ? familyOfPart.get(site) : undefined);
    if (!family) return keysEveryFamily(compound) ? { family: EVERY_FAMILY, part: partOf(compound, EVERY_FAMILY, undefined) } : undefined;
    return { family, part: partOf(compound, family, site) };
  };

  return anatomyOf;
}

function unique(anatomies: (Anatomy | undefined)[]): Anatomy[] {
  const found = new Map<string, Anatomy>();
  for (const anatomy of anatomies) if (anatomy) found.set(anatomyKey(anatomy), anatomy);
  return [...found.values()];
}

export function createAnatomyResolver(contract: SkinContract): (selector: string) => Anatomy[] {
  const anatomyOf = createAnatomyOf(contract);
  return (selector) => unique(compoundsOf(selector).map(anatomyOf));
}

function subjectCompounds(selector: string): Compound[] {
  const compounds: Compound[] = [];
  selectorParser((root) => {
    root.each((current) => {
      compounds.push(...flattenCompound(subjectCompound(current)));
    });
  }).processSync(selector);
  return compounds;
}

/** A rule paints its subject. The compounds above it only say where the subject sits. */
export function createSubjectAnatomyResolver(contract: SkinContract): (selector: string) => Anatomy[] {
  const anatomyOf = createAnatomyOf(contract);
  return (selector) => unique(subjectCompounds(selector).map(anatomyOf));
}

/** The library's own composed treatments: the one vocabulary a skin may `@apply` onto anatomy. */
export function collectEffectUtilities(): Set<string> {
  const source = readFileSync(path.join(CORE_ROOT, "effects.css"), "utf8");
  return new Set([...source.matchAll(/@utility\s+([\w-]+)/g)].map((match) => match[1]));
}

export type KnobOwnership = Map<string, Map<string, Set<string>>>;

function recordPaint(ownership: KnobOwnership, anatomy: Anatomy, property: string, knobs: readonly string[]): void {
  const owned = knobs.filter((knob) => familyOwns(knob, anatomy.family));
  if (owned.length === 0) return;
  const byProperty = ownership.get(anatomyKey(anatomy)) ?? new Map<string, Set<string>>();
  const forProperty = byProperty.get(property) ?? new Set<string>();
  for (const knob of owned) forProperty.add(knob);
  byProperty.set(property, forProperty);
  ownership.set(anatomyKey(anatomy), byProperty);
}

/** Every CSS property core paints from a knob, keyed by the anatomy it paints it on. */
export function collectKnobOwnership(
  contract: SkinContract,
  resolveAnatomy: (selector: string) => Anatomy[] = createAnatomyResolver(contract),
): KnobOwnership {
  const ownership: KnobOwnership = new Map();
  const recipeRoot = path.join(CORE_ROOT, "recipes");
  const files = [
    path.join(CORE_ROOT, "theme.css"),
    ...readdirSync(recipeRoot)
      .filter((name) => name.endsWith(".css"))
      .map((name) => path.join(recipeRoot, name)),
  ];

  for (const file of files) {
    const root = postcss.parse(readFileSync(file, "utf8"), { from: file });
    const behindPrivates = knobsBehindPrivates(root);
    root.walkDecls((declaration) => {
      if (declaration.prop.startsWith("--") || declaration.parent?.type !== "rule") return;
      const knobs = readVars(declaration.value).flatMap((name) => behindPrivates.get(name) ?? [name]);
      if (knobs.length === 0) return;
      for (const anatomy of resolveAnatomy(declaration.parent.selector)) {
        recordPaint(ownership, anatomy, declaration.prop, knobs);
      }
    });
  }
  return ownership;
}

/** A recipe rule keyed on the family alone paints every part of it, so its knobs own the property there too. */
export function knobsPainting(ownership: KnobOwnership, anatomy: Anatomy, property: string): string[] {
  if (anatomy.family === EVERY_FAMILY) {
    const partOfKey = (key: string): string => key.slice(key.indexOf(anatomySeparator) + 1);
    const reached = [...ownership.entries()].filter(([key]) => {
      const part = partOfKey(key);
      return anatomy.part === undefined || part === "" || part === anatomy.part;
    });
    return [...new Set(reached.flatMap(([, byProperty]) => [...(byProperty.get(property) ?? [])]))];
  }
  const reaching = [
    { family: EVERY_FAMILY, part: undefined },
    { family: EVERY_FAMILY, part: anatomy.part },
    { family: anatomy.family, part: undefined },
    anatomy,
  ];
  return [...new Set(reaching.flatMap((key) => [...(ownership.get(anatomyKey(key))?.get(property) ?? [])]))];
}
